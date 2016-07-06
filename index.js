'use strict';

const StorageClient = require('./storage-client');
const DbStorage = require('./db/storage');
const conf = require('./conf')();

function main() {

  const st = new DbStorage({ dsn: conf.db.dsn });

  const client = new StorageClient({
    url: conf.storage.url
  });

  client.onTweets(tweets => {
    st.addTweets(tweets)
      .then(() => console.log('Tweets added:', tweets.length),
        (e) => console.error('addTweets() ERR:', e));
  });

  client.onDeletions(deletions => {
    st.addDeletions(deletions)
      .then(() => console.log('Deletions added:', deletions.length),
        (e) => console.error('addDeletions() ERR:', e));
  });
}

main();
