const axios = require('axios');
const cheerio = require('cheerio');

async function testBing() {
  try {
    const url = "https://www.bing.com/search?q=site:ajio.com+running+shoes";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    console.log('Bing fetched, length:', data.length);
    const $ = cheerio.load(data);
    const results = $('.b_algo');
    console.log('Results:', results.length);
    
    results.each((i, el) => {
       const title = $(el).find('h2 a').text();
       const link = $(el).find('h2 a').attr('href');
       const desc = $(el).find('.b_caption p').text() || $(el).find('.b_algoSlug').text();
       const img = $(el).find('img').attr('src');
       console.log({ title, link, img: img ? img.substring(0, 30) : 'none', desc: desc.substring(0, 50) });
    });
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testBing();
