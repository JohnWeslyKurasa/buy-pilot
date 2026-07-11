const http = require('http');

const data = JSON.stringify({ query: 'laptop' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log('Total Results:', parsed.count);
      const providers = new Set();
      parsed.results.forEach(group => {
        group.offers.forEach(o => providers.add(o.marketplace));
      });
      console.log('Providers returned:', Array.from(providers));
    } catch (e) {
      console.log('Parse error:', body);
    }
  });
});

req.on('error', console.error);
req.write(data);
req.end();
