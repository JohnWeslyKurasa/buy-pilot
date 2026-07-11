const axios = require('axios');
const cheerio = require('cheerio');

async function testAllYahoo() {
  const sites = [
    { name: 'Ajio', domain: 'ajio.com', query: 'running shoes' },
    { name: 'Croma', domain: 'croma.com', query: 'headphones' },
    { name: 'Nykaa', domain: 'nykaa.com', query: 'lipstick' },
    { name: 'Meesho', domain: 'meesho.com', query: 'shirt' }
  ];

  for (const site of sites) {
    try {
      const url = "https://search.yahoo.com/search?p=site:" + site.domain + "+" + site.query;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      const $ = cheerio.load(data);
      const results = $('.algo-sr');
      console.log("[" + site.name + "] Results: " + results.length);
      
      results.each((i, el) => {
         if (i > 1) return;
         const titleEl = $(el).find('.compTitle a');
         const title = titleEl.text() || titleEl.attr('aria-label');
         const link = titleEl.attr('href');
         const desc = $(el).find('.compTitle').next().text() || $(el).find('.fc-falcon').text();
         console.log("  - " + title + " | " + desc.substring(0, 50));
      });
    } catch(e) {
      console.log("[" + site.name + "] Error: " + e.message);
    }
  }
}
testAllYahoo();
