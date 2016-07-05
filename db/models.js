'use strict';

const Sequelize = require('sequelize');

module.exports = function (db) {

  const User =db.define('user', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    creationTime: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    screenName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    protected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    favouritesCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    followersCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    friendsCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    listedCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    statusesCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },



    lastTweetTime: {
      type: Sequelize.DATE,
    },
  });

  const Tweet = db.define('tweet', {

    // tweet related

    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    creationTime: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    text: {
      type: Sequelize.STRING
    },

    // deletion related

    isDeleted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deletionTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    chainId: {
      type: Sequelize.INTEGER
      //TODO!!!
    },

    // user related

    userName: {
      type: Sequelize.STRING
    },
    userScreenName: {
      type: Sequelize.STRING
    },
    userProtected: {
      type: Sequelize.BOOLEAN
    },
    userVerified: {
      type: Sequelize.BOOLEAN
    },
  });

  const UnresolvedDeletion = db.define('unresolvedDeletion', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    time: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  Tweet.belongsTo(User);

  return {
    Tweet: Tweet,
    User: User,
    UnresolvedDeletion: UnresolvedDeletion,
  };

};
