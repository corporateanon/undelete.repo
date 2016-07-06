const DbStorage = require('./db/storage');
const conf = require('./conf')();
const st = new DbStorage({ dsn: conf.db.dsn });
st.dropAll();
