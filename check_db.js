const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.urhgbhatzfqknsymgggq:Sanchitrai%4001@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'User';
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
