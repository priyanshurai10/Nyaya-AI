const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.urhgbhatzfqknsymgggq:Sanchitrai%4001@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  await client.query("UPDATE auth.users SET instance_id = '00000000-0000-0000-0000-000000000000'"); 
  console.log('Update Success'); 
  await client.end(); 
} 
main();
