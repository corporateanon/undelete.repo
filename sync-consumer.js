'use strict';

const t = require('tcomb');
const fromJSON = require('tcomb/lib/fromJSON');

const ParseableDate = t.refinement(t.Date, () => true, 'ParseableDate');
ParseableDate.fromJSON = (n) => new Date(n);
const func = t.func;
const maybe = t.maybe;
const list = t.list;
const Dat = t.Date;
const Any = t.Any;

const SyncConsumerOptions = t.struct({
  onRequest: func([maybe(Dat)], Any),
  onData: maybe(func([list(Any)], Any)),
}, 'SyncConsumerOptions');

const SyncConsumerBatch = t.struct({
  messages: list(Any),
  lastTime: maybe(ParseableDate),
}, 'SyncConsumerBatch');


module.exports = class SyncConsumer {

  constructor(options) {
    this.options = SyncConsumerOptions(options);
    this.lastUpdateTime = null;
  }

  consume(batch) {
    batch = fromJSON(batch, SyncConsumerBatch);
    if (batch.lastTime) {
      this._lastUpdateTime = batch.lastTime;
    }
    if (batch.messages.length && this.options.onData) {
      this.options.onData.call(null, batch.messages);
    }
  }

  wakeUp() {
    this._request();
  }

  _request() {
    this.options.onRequest.call(null, this.lastUpdateTime);
  }
};
