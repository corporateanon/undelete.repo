'use strict';

module.exports = function getConfig() {
  var env = process.env;

  return {
    db: {
      dsn: env.DbDsn,
    },
    storage: {
      url: env.StorageUrl
    }
  };
};
