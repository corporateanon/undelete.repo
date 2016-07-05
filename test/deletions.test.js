/* jshint mocha: true */
'use strict';

require('should');
const DbStorage = require('../db/storage');
const d = require('./data');


describe('Adding deletions.', () => {
  var storage;

  beforeEach(() => {
    storage = new DbStorage({
      // dsn: 'sqlite://:memory:' //in real life it's PostgreSQL, dude!
      dsn: 'postgresql://postgres:asd123@localhost/undelete_test'
    });
    return storage.dropAll();
  });

  ////////

  describe('addDeletions()', () => {

    it('should update existing tweet', () => {
      return storage
        .addTweets([d.tweetBobOne, d.tweetAliceOne])
        .then(() => storage.addDeletions([{
            id: d.tweetAliceOne.id,
            time: new Date(),
          }
        ]))
        .then(() => Promise.all([
          storage.models.Tweet.findAll({where:{isDeleted: true}}).then(twts=>twts.map(twt=>twt.id)),
          storage.models.UnresolvedDeletion.count(),
        ]))
        .should.eventually.eql([[d.tweetAliceOne.id], 0]);
    });

    it('should add to unresolvedDeletions, if a tweet does not exist', () => {
      return storage
        .addTweets([d.tweetBobOne, d.tweetAliceOne])
        .then(() => storage.addDeletions([{
            id: d.tweetAliceTwo.id,
            time: new Date(),
          }
        ]))
        .then(() => Promise.all([
          storage.models.Tweet.count({where:{isDeleted: true}}),
          storage.models.UnresolvedDeletion.count(),
        ]))
        .should.eventually.eql([0, 1]);
    });

    it('should remove from unresolvedDeletions, when a tweet appears', () => {
      return storage
        .addTweets([d.tweetBobOne, d.tweetAliceOne])
        .then(() => storage.addDeletions([{
            id: d.tweetAliceTwo.id,
            time: new Date(),
          }
        ]))
        .then(() => storage.addTweets([d.tweetAliceTwo]))
        .then(() => Promise.all([
          storage.models.Tweet.count({where:{isDeleted: true}}),
          storage.models.UnresolvedDeletion.count(),
        ]))
        .should.eventually.eql([1, 0]);
    });

  });

});

