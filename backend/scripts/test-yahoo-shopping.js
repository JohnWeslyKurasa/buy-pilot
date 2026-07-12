const axios = require('axios');
const cheerio = require('cheerio');

async function testYahooShopping() {
  try {
    const url = "https://shopping.yahoo.com/search?p=site:ajio.com+running+shoes";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    console.log('Yahoo Shopping fetched, length:', data.length);
    const $ = cheerio.load(data);
    const results = $('.s-item');
    console.log('Results:', results.length);
    if (results.length === 0) {
       console.log('Checking for any img tag with src containing product');
       const images = [];
       $('img').each((i, el) => {
           const src = $(el).attr('src');
           if (src && !src.includes('favicon')) {
               images.push(src);
           }
       });
       console.log('Found images:', images.slice(0,5));
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testYahooShopping();
