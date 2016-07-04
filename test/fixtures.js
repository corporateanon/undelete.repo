'use strict';

exports.getTimeline = function getTimeline(len) {
  const step = 1000;
  const now = new Date();
  const results = [];
  for (var t = now - len * step + step; t <= now; t += step) {
    results.push(new Date(t));
  }
  return results;
};



exports.getUser = function getUser(id) {
  return {
    id              : id,
    id_str          : '' + id,
    created_at      : null,
    name            : '',
    screen_name     : '',
    protected       : false,
    verified        : false,
    favourites_count: 0,
    followers_count : 0,
    friends_count   : 0,
    listed_count    : 0,
    statuses_count  : 0,
  };
};

exports.getTweet = function getTweet(id) {
  return {
    id: '' + id,
    body: {
      id        : id,
      id_str    : '' + id,
      created_at: null,
      text      : '',

      user: {
        id              : 0,
        id_str          : '0',
        created_at      : null,
        name            : '',
        screen_name     : '',
        protected       : false,
        verified        : false,
        favourites_count: 0,
        followers_count : 0,
        friends_count   : 0,
        listed_count    : 0,
        statuses_count  : 0,
      }
    },
    attachments: [],
  };
};
