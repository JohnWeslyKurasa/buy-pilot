const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const { data } = await axios.get('https://www.flipkart.com/search?q=running+shoes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    const items = $("div[data-id]");
    console.log('Flipkart items found:', items.length);
  } catch (err) {
    console.log('Error:', err.message);
  }
}
test();
