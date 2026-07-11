const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const { data } = await axios.get('https://html.duckduckgo.com/html/?q=site:amazon.in+running+shoes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const $ = cheerio.load(data);
    console.log('Found:', $('.result').length);
    $('.result').slice(0, 3).each((_, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const url = $(el).find('.result__url').text().trim();
      console.log(title, '|', url, '|', snippet);
    });
  } catch (err) {
    console.error(err.message);
  }
}
run();
