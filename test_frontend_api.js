// Test script to run in browser context
async function testClient() {
  const fetch = require('node-fetch');
  const res = await fetch('http://localhost:3000/api/v1/academy/courses');
  const data = await res.json();
  console.log("coursesRes:", data);
}

testClient();
