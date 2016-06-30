'use strict';

// var SocketIOClient = require('socket.io-client');


// var sock = new SocketIOClient('http://localhost:3001');

// sock.on('connect', () => console.log('connect'));
// sock.on('reconnect', () => console.log('reconnect'));

const StorageClient = require('./storage-client');

function main() {

  const client = new StorageClient({
    url: 'http://localhost:3001'
  });

  client.onTweets(tweets => {
    console.log('tweets.length', tweets.length);
  });

  client.onDeletions(deletions => {
    console.log('deletions', deletions);
  });
}

main();
