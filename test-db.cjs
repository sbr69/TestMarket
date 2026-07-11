const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:4cRctQMRtjJBxT1W@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => console.log('Connected directly!'))
  .catch(err => console.error('Direct connection failed:', err.message));
