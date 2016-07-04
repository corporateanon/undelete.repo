/* jshint mocha: true */
'use strict';

require('should');
const moment = require('moment');
const fixtures = require('./fixtures');
const DbStorage = require('../db/storage');



describe('DB storage', () => {
  var storage;

  const userBob = fixtures.getUser(1001);
  Object.assign(userBob, {
    name       : 'Bob',
    screen_name: 'bob',
    created_at : moment().subtract('days', 10).toDate(),
  });

  const userBobNew = fixtures.getUser(1001);
  Object.assign(userBobNew, {
    name       : 'Bob New',
    screen_name: 'bobNew',
    created_at : moment().subtract('days', 10).toDate(),
  });

  const userAlice = fixtures.getUser(1002);
  Object.assign(userAlice, {
    name       : 'Alice',
    screen_name: 'alice',
    created_at : moment().subtract('days', 10).toDate(),
  });

  const userAliceNew = fixtures.getUser(1002);
  Object.assign(userAliceNew, {
    name       : 'Alice New',
    screen_name: 'aliceNew',
    created_at : moment().subtract('days', 10).toDate(),
  });

  ////////

  const tweetBobOne = fixtures.getTweet(749);
  Object.assign(tweetBobOne.body, {
    created_at: moment().subtract('minutes', 100).toDate(),
    text      : 'tweetBobOne',
    user      : userBob
  });

  const tweetBobTwo = fixtures.getTweet(780);
  Object.assign(tweetBobTwo.body, {
    created_at: moment().subtract('minutes', 99).toDate(),
    text      : 'tweetBobTwo',
    user      : userBobNew
  });

  const tweetAliceOne = fixtures.getTweet(750);
  Object.assign(tweetAliceOne.body, {
    created_at: moment().subtract('minutes', 98).toDate(),
    text      : 'tweetAliceOne',
    user      : userAlice
  });

  const tweetAliceTwo = fixtures.getTweet(757);
  Object.assign(tweetAliceTwo.body, {
    created_at: moment().subtract('minutes', 97).toDate(),
    text      : 'tweetAliceTwo',
    user      : userAliceNew
  });

  ////////

  beforeEach(() => {
    storage = new DbStorage({
      dsn: 'sqlite://:memory:' //in real life it's PostgreSQL, dude!
    });
    return storage.dropAll();
  });

  ////////

  describe('Simple transaction - unique users and tweets', () => {
    it('should add 2 tweets and 2 users', () => {
      return storage
        .put([tweetBobOne, tweetAliceOne])
        .then(() => Promise.all([storage.models.User.count(), storage.models.Tweet.count()]))
        .should.eventually.eql([2, 2]);
    });
  });


  describe('Two tweets by the same user, one by another', () => {
    it('should add 3 tweets and 2 users', () => {
      return storage
        .put([tweetBobOne, tweetAliceOne, tweetAliceTwo])
        .then(() => Promise.all([storage.models.User.count(), storage.models.Tweet.count()]))
        .should.eventually.eql([2, 3]);
    });
  });


  describe('One user has to be updated, another has not', () => {
    it('should update Bob, not Alice', () => {

      return storage.put([tweetBobOne, tweetAliceTwo])
        .then(() => storage.put([tweetBobTwo, tweetAliceOne]))
        .then(() => Promise.all([
          storage.models.User.findOne({ where: { id: userAlice.id_str } }),
          storage.models.User.findOne({ where: { id: userBob.id_str } }),
        ]))
        .then(users => users.map(it => it.name))
        .should.eventually.eql(['Alice New', 'Bob New']);
    });
  });
});
