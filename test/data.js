const moment = require('moment');
const fixtures = require('./fixtures');

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

module.exports = {
  tweetBobOne  : tweetBobOne,
  tweetBobTwo  : tweetBobTwo,
  tweetAliceOne: tweetAliceOne,
  tweetAliceTwo: tweetAliceTwo,
  
  userBob      : userBob,
  userBobNew   : userBobNew,
  userAlice    : userAlice,
  userAliceNew : userAliceNew,
};
