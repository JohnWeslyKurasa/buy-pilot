const axios = require('axios');
const cheerio = require('cheerio');

async function testYahooImages() {
  try {
    const url = "https://images.search.yahoo.com/search/images?p=site:ajio.com+running+shoes";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    console.log('Yahoo Images fetched, length:', data.length);
    const $ = cheerio.load(data);
    const results = $('#sres .ld');
    console.log('Results:', results.length);
    
    results.each((i, el) => {
       if (i > 3) return;
       const a = $(el).find('a');
       const rawHref = a.attr('href');
       const img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
       const alt = $(el).find('img').attr('alt');
       
       console.log({ rawHref: rawHref ? rawHref.substring(0,40) : null, img, alt });
    });
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testYahooImages();
