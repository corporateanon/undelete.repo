const Sequelize = require('sequelize');

module.exports = function (db) {
  return db.define('tweet', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    text: {
      type: Sequelize.STRING
    },
  });
};
