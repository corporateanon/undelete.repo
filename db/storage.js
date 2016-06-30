'use strict';

const co = require('co');
const Sequelize = require('sequelize');
const Tweet = require('./tweet');
const t = require('tcomb');


const DbStorageOptions = t.struct({
  dsn: t.String,
});


module.exports = class DbStorage {

  constructor(options) {
    const o = new DbStorageOptions(options);
    this.db = new Sequelize(o.dsn);
    this.models = this.defineModels();
  }

  defineModels() {
    return {
      Tweet: Tweet(this.db)
    };
  }

  put(id, text) {
    return this.models.Tweet.create({id: id, text: text});
  }

  connect() {
    return co(function* () {
      yield this.db.authenticate();
      yield this.db.sync();
    }.bind(this));
  }


}
