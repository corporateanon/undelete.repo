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

  put(tweets) {
    return co(function* () {
      const Tweet = this.models.Tweet;
      const User = this.models.User;

      tweets = t.list(appTypes.Tweet)(tweets);
      // tweets = _.sortBy(tweets, twt => -twt.body.created_at);

      const inputIds = tweets.map(it => it.body.id_str);
      const existingTweets = yield Tweet.findAll({ attributes:['id'], where: { id: { $in: inputIds } } });
      const existingTweetIds = existingTweets.map(it => it.id);
      const tweetIdsToInsert = _.difference(inputIds, existingTweetIds);
      const tweetsToInsert = _(tweets)
        .intersectionWith(tweetIdsToInsert, (twt, id) => twt.body.id_str === id)
        .sortBy(twt => -twt.body.created_at)
        .value();


      const tweetsUniqByUser = _(tweetsToInsert)
        .uniqBy(twt => twt.body.user.id_str)
        .groupBy(twt => twt.body.user.id_str)
        .mapValues(twtList => twtList[0])
        .value();

      // console.log(tweetsUniqByUser);
      // console.log(tweetsToInsert);

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

      try {
        yield this.models.User.bulkCreate(usersToInsert);
      } catch(e) {
        throw new Error('Could not bulk insert users');
      }
      

      const insertTweets = _(tweetsToInsert)
        .map('body')
        .map(convertTweet.toTweet)
        .value();
      yield Tweet.bulkCreate(insertTweets);


      const usersToUpdate = _(tweetsUniqByUser)
        .filter(twt => existingUsersLastTweetTimesById[twt.body.user.id_str] &&
            existingUsersLastTweetTimesById[twt.body.user.id_str].lastTweetTime < twt.body.created_at)
        .map('body')
        .map(convertTweet.toUser)
        .value();

      console.log('usersToUpdate', usersToUpdate);

      for (let i = 0; i < usersToUpdate.length; i++) {
        let user = usersToUpdate[i];
        yield this.models.User.update(user, { where: {id: user.id} }); //WHY does it work?
      }


      // const usersToUpsert = tweetsUniqByUser.map;








      // const plainTweet = convertTweet.toTweet(twt);

      // const existingTweet = yield Tweet.findOne({ where: {id: plainTweet.id} });

      // console.log(existingTweet)

      // if (existingTweet) {
      //   return false;
      // }

      // const plainUser = convertTweet.toUser(twt);

      // const user = (yield User.findOrCreate({ where: { id: plainUser.id }, defaults: plainUser}))[0];
      // yield user.update(plainUser);

      // const newTweet = Tweet.build(plainTweet);
      // newTweet.userId = user.id;
      // yield newTweet.save();

    }.bind(this));
  }

  _storeTweetsUsers(tweetsUniqByUser) {

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
