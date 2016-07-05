/* jshint mocha: true */
'use strict';

require('should');
const DbStorage = require('../db/storage');
const d = require('./data');

////////

describe('Adding tweets.', () => {
  var storage;

  beforeEach(() => {
    storage = new DbStorage({
      dsn: 'sqlite://:memory:' //in real life it's PostgreSQL, dude!
    });
    return storage.dropAll();
  });


  describe('Simple transaction - unique users and tweets', () => {
    it('should add 2 tweets and 2 users', () => {
      return storage
        .addTweets([d.tweetBobOne, d.tweetAliceOne])
        .then(() => Promise.all([storage.models.User.count(), storage.models.Tweet.count()]))
        .should.eventually.eql([2, 2]);
    });
  });


  describe('Two tweets by the same user, one by another', () => {
    it('should add 3 tweets and 2 users', () => {
      return storage
        .addTweets([d.tweetBobOne, d.tweetAliceOne, d.tweetAliceTwo])
        .then(() => Promise.all([storage.models.User.count(), storage.models.Tweet.count()]))
        .should.eventually.eql([2, 3]);
    });
  });


  describe('One user has to be updated, another has not', () => {
    it('should update Bob, not Alice', () => {

      return storage.addTweets([d.tweetBobOne, d.tweetAliceTwo])
        .then(() => storage.addTweets([d.tweetBobTwo, d.tweetAliceOne]))
        .then(() => Promise.all([
          storage.models.User.findOne({ where: { id: d.userAlice.id_str } }),
          storage.models.User.findOne({ where: { id: d.userBob.id_str } }),
        ]))
        .then(users => users.map(it => it.name))
        .should.eventually.eql(['Alice New', 'Bob New']);
    });
  });
});
