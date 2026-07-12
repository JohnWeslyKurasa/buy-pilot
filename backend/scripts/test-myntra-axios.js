const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const { data } = await axios.get('https://www.myntra.com/running-shoes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    console.log('Success, length:', data.length);
    console.log(data.substring(0, 500));
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
