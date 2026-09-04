const https = require('https');

setTimeout(() => {
  const req = https.request('https://nyaya-ai-backend-tyy5.onrender.com/api/v1/location/seed', { method: 'POST' }, (res) => {
    console.log('Seed triggered:', res.statusCode);
  });
  req.on('error', (e) => {
    console.error('Seed error:', e);
  });
  req.end();
}, 180000); // Wait 3 minutes for Render to deploy
