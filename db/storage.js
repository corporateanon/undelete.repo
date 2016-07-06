'use strict';

const co = require('co');
const _ = require('lodash');
const Sequelize = require('sequelize');
const models = require('./models');
const t = require('tcomb');
const convertTweet = require('./convert-tweet');
const appTypes = require('../app-types');


const DbStorageOptions = t.struct({
  dsn: t.String,
});


module.exports = class DbStorage {

  constructor(options) {
    const o = new DbStorageOptions(options);
    this.db = new Sequelize(o.dsn);
    this.models = models(this.db);
  }

  addDeletions(deletions) {
    return co(function* () {
      const Tweet = this.models.Tweet;
      const Del = this.models.UnresolvedDeletion;

      deletions = t.list(appTypes.Deletion)(deletions);

      const uniqueDeletions = _(deletions).uniqBy('id').value(); //just in case

      const uniqueDeletionIds = _(uniqueDeletions).map('id').value();
      const existingTweets = yield Tweet.findAll({ where: { id: { $in: uniqueDeletionIds} } });
      const existingDeletions = yield Del.findAll({ where: { id: { $in: uniqueDeletionIds} } });

      const deletionsToInsert = _(uniqueDeletions)
        .differenceBy(existingTweets, 'id')
        .differenceBy(existingDeletions, 'id')
        .value();

      yield Del.bulkCreate(deletionsToInsert);

      const tweetsToUpdate = _(existingTweets)
        .filter(twt => !twt.isDeleted)
        .value();

      const deletionsById = _(uniqueDeletions)
        .groupBy('id')
        .mapValues(0)
        .value();

      for (let i = 0; i < tweetsToUpdate.length; i++) {
        let tweet = tweetsToUpdate[i];
        yield tweet.update({
          isDeleted: true,
          deletionTime: deletionsById[tweet.id].time, //todo: Use time diff to synchronize clock
        });
      }

      //All the deletion IDs that do not yet have any corresponding tweet, should be inserted to UnresolvedDeletions (if they do not yet exist).
      //With the rest ones:
      //- skip the deletions, which tweets are already have "deleted" flag
      //- update tweets that have no "deleted" flag
    }.bind(this));
  }

  addTweets(tweets) {
    return co(function* () {
      const Tweet = this.models.Tweet;
      const User = this.models.User;

      tweets = t.list(appTypes.Tweet)(tweets);

      const inputIds = tweets.map(it => it.body.id_str);
      const existingTweets = yield Tweet.findAll({ attributes:['id'], where: { id: { $in: inputIds } } });
      const existingTweetIds = existingTweets.map(it => it.id);
      const tweetIdsToInsert = _.difference(inputIds, existingTweetIds);
      const tweetsToInsert = _(tweets)
        .intersectionWith(tweetIdsToInsert, (twt, id) => twt.body.id_str === id)
        .sortBy(twt => -twt.body.created_at)
        .value();

      //todo: ensure that tweetsToInsert contain only unique IDs

      const tweetsUniqByUser = _(tweetsToInsert)
        .uniqBy(twt => twt.body.user.id_str)
        .groupBy(twt => twt.body.user.id_str)
        .mapValues(twtList => twtList[0])
        .value();

      const existingUsers = yield User.findAll({
        attributes:['id', 'lastTweetTime'],
        where: { id: { $in: Object.keys(tweetsUniqByUser) } }
      });

      const existingUsersLastTweetTimesById = _(existingUsers)
        .groupBy(it => it.id)
        .mapValues(it => it[0])
        .value();

      const usersToInsert = _(tweetsUniqByUser)
        .filter(twt => !existingUsersLastTweetTimesById[twt.body.user.id_str])
        .map('body')
        .map(convertTweet.toUser)
        .value();

      yield this.models.User.bulkCreate(usersToInsert);

      const insertTweets = _(tweetsToInsert)
        .map('body')
        .map(convertTweet.toTweet)
        .value();
      yield Tweet.bulkCreate(insertTweets);

      yield this._resolveDeletions(_(insertTweets).map('id').value());

      const usersToUpdate = _(tweetsUniqByUser)
        .filter(twt => existingUsersLastTweetTimesById[twt.body.user.id_str] &&
            existingUsersLastTweetTimesById[twt.body.user.id_str].lastTweetTime < twt.body.created_at)
        .map('body')
        .map(convertTweet.toUser)
        .value();

      for (let i = 0; i < usersToUpdate.length; i++) {
        let user = usersToUpdate[i];
        yield this.models.User.update(user, { where: {id: user.id} }); //WHY does it work?
      }

    }.bind(this));
  }

  _resolveDeletions(tweetIds) {
    return co(function* () {
      //Select deletions by ids.
      //Select tweets by ids of found deletions.
      //Update each tweet with isDeleted=true, deletionTime=time
      //Delete the deletions by ids of found deletions.
      const Tweet = this.models.Tweet;
      const Del = this.models.UnresolvedDeletion;

      const foundDeletions = yield Del.findAll({ where: { id: { $in:tweetIds } } });

      const foundDeletionsIds = _(foundDeletions)
        .map('id')
        .value();

      const foundDeletionsById = _(foundDeletions)
        .groupBy('id')
        .mapValues(0)
        .value();

      const tweetsToUpdate = yield Tweet.findAll({ where: { id: { $in:foundDeletionsIds } } });

      for (let i = 0; i < tweetsToUpdate.length; i++) {
        let tweet = tweetsToUpdate[i];
        yield tweet.update({
          isDeleted: true,
          deletionTime: foundDeletionsById[tweet.id].time,
        });
      }

      if(foundDeletionsIds.length) {
        yield Del.destroy({ where: { id: { $in: foundDeletionsIds }}});
      }

    }.bind(this));
  }

  dropAll() {
    return this.db.sync({
      force: true
    });
  }

  connect() {
    return co(function* () {
      yield this.db.authenticate();
      yield this.db.sync();
    }.bind(this));
  }

};
