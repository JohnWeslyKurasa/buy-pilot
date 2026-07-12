const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    console.log('Fetching...');
    const ddgUrl = `https://html.duckduckgo.com/html/?q=site:myntra.com+running+shoes`;
    const { data } = await axios.get(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    console.log('Success, length:', data.length);
    require('fs').writeFileSync('ddg.html', data);
    const $ = cheerio.load(data);
    const results = $('.result');
    console.log('Results found:', results.length);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
