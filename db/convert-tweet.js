'use strict';

const t = require('tcomb');
const types = require('../twitter-types');

function toTweet(twt) {
  twt = new types.TwitterTweet(twt);

  return {
    id            : twt.id_str,
    creationTime  : twt.created_at,
    text          : twt.text,
    
    userId        : twt.user.id_str,
    userName      : twt.user.name,
    userScreenName: twt.user.screen_name,
    userProtected : twt.user.protected,
    userVerified  : twt.user.verified,
  };
}

function toUser(twt) {
  twt = new types.TwitterTweet(twt);

  const usr = twt.user;

  return {
    id             : usr.id_str,
    creationTime   : usr.created_at,
    name           : usr.name,
    screenName     : usr.screen_name,
    protected      : usr.protected,
    verified       : usr.verified,
    favouritesCount: usr.favourites_count,
    followersCount : usr.followers_count,
    friendsCount   : usr.friends_count,
    listedCount    : usr.listed_count,
    statusesCount  : usr.statuses_count,

    lastTweetTime  : twt.created_at,
  };
}

exports.toTweet = toTweet;
exports.toUser = toUser;
