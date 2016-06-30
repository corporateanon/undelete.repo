'use strict';

const SocketIOClient = require('socket.io-client');
const EventEmitter = require('events').EventEmitter;
const SyncConsumer = require('./sync-consumer');
const t = require('tcomb');
const fromJSON = require('tcomb/lib/fromJSON');
const Deletion = require('./app-types').Deletion;
const Tweet = require('./app-types').Tweet;


const StorageClientOptions = t.struct({
  url: t.Str,
}, 'StorageClientOptions');


module.exports = class StorageClient extends EventEmitter {

  constructor(options) {
    super();
    const o = new StorageClientOptions(options);
    this._client = new SocketIOClient(o.url);

    this._tweetsConsumer = new SyncConsumer({
      onRequest: (since) => this._client.emit('getTweets', { since: since }),
      onData: (tweets) => this.emit('tweets', this._unserializeTweets(tweets)),
    });

    this._deletionsConsumer = new SyncConsumer({
      onRequest: (since) => this._client.emit('getDeletions', { since: since }),
      onData: (deletions) => this.emit('deletions', this._unserializeDeletions(deletions)),
    });

    this._subscribeSocket();
  }

  onTweets(handler) {
    this.on('tweets', handler);
  }

  onDeletions(handler) {
    this.on('deletions', handler);
  }

  _subscribeSocket() {
    const client = this._client;
    const tweetsConsumer = this._tweetsConsumer;
    const deletionsConsumer = this._deletionsConsumer;

    client.on('connect', () => {
      tweetsConsumer.wakeUp();
      deletionsConsumer.wakeUp();
    });
    client.on('tweets', batch => tweetsConsumer.consume(batch));
    client.on('deletions', batch => deletionsConsumer.consume(batch));
  }

  _unserializeTweets(tweets) {
    return tweets.map(tweet => fromJSON(JSON.parse(tweet), Tweet));
  }

  _unserializeDeletions(deletions) {
    return deletions.map(deletion => fromJSON(JSON.parse(deletion), Deletion));
  }

};
