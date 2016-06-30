'use strict';

const t = require('tcomb');
const TwitterTweet = require('./twitter-types').TwitterTweet;


const Attachment = t.struct({
  url: t.String,
  body: t.String,
}, 'Attachment');

const Deletion = t.struct({
  id: t.String
}, 'Deletion');

const Tweet = t.struct({
  id: t.String,
  body: TwitterTweet,
  attachments: t.maybe(t.list(Attachment)),
}, 'Tweet');

exports.Tweet = Tweet;
exports.Deletion = Deletion;
exports.Attachment = Attachment;
