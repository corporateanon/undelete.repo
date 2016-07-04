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
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    chainId: {
      type: Sequelize.INTEGER
      //TODO!!!
    },

    // user related

    // userId: {
    //   type: Sequelize.STRING
    // },
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


  Tweet.belongsTo(User);


  return {
    Tweet: Tweet,
    User: User,
  };

};



// id_str: Str,
// originalCreatedAt: TwitterDate,
// text: Str,
// user: TwitterUser,











  // id_str: Str,
  // screen_name: Str,
  // name: Str,
  // created_at: TwitterDate, //note: "Mon Nov 29 21:18:15 +0000 2010" 
  // entities: maybe(list(TwitterEntity)),
  // favourites_count: Num,
  // followers_count: Num,
  // friends_count: Num,
  // listed_count: Num,
  // protected: Bool,
  // statuses_count: Num,
  // verified: Bool,
