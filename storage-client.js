'use strict';

const SocketIOClient = require('socket.io-client');
const EventEmitter = require('events').EventEmitter;
const t = require('tcomb');


const StorageClientOptions = t.struct({
  url: t.Str,
}, 'StorageClientOptions');


module.exports = class StorageClient extends EventEmitter {
  constructor(options) {
    super();
    const o = new StorageClientOptions(options);
    this._client = new SocketIOClient(o.url);
    this._lastUpdateTime = null;
    this._subscribeSocket();
  }

  onMessages(handler) {
    this.on('messages', handler);
  }

  _subscribeSocket() {
    const client = this._client;

    client.on('messages', this._clientOnMessages.bind(this));
    client.on('connect', this._clientOnConnect.bind(this));
  }

  _clientOnConnect() {
    this._requestRecentMessages();
  }

  _clientOnMessages(data) {
    //todo: type-check messages
    //todo: type-check messages
    //todo: type-check messages
    //todo: type-check messages
    if (data.lastTime) {
      this._lastUpdateTime = data.lastTime;
    }
    if (data.messages.length) {
      this.emit('messages', data.messages);
    }
  }

  _requestRecentMessages() {
    this._client.emit('getMessages', {
      since: this._lastUpdateTime
    });
  }
};
