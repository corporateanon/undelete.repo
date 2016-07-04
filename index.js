'use strict';

const StorageClient = require('./storage-client');
const DbStorage = require('./db/storage');
const co = require('co');

function main() {

  const s = new DbStorage({
    dsn: 'postgres://postgres:asd123@localhost/undelete'
  });

  const client = new StorageClient({
    url: 'http://localhost:3001'
  });

  client.onTweets(tweets => {
    console.log('tweets.length', tweets.length);

    co(function* () {
      for (let i = 0; i < tweets.length; i++) {
        yield s.put(tweets[i].body);
      }
    }).then(() => console.log('ok!'), (e) => console.error('ERR', e));
  });

  client.onDeletions(deletions => {
    console.log('deletions', deletions);
  });
}

main();
