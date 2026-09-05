const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.urhgbhatzfqknsymgggq:Sanchitrai%4001@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"); 
  console.log(res.rows.map(r => r.table_name)); 
  await client.end(); 
} 
main();
