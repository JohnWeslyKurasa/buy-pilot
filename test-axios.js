const axios = require('axios');

async function testAll() {
  const sites = [
    { name: 'Myntra', url: 'https://www.myntra.com/running-shoes' },
    { name: 'Ajio', url: 'https://www.ajio.com/search/?text=running%20shoes' },
    { name: 'Croma', url: 'https://www.croma.com/searchB?q=headphones' },
    { name: 'Nykaa', url: 'https://www.nykaa.com/search/result/?q=lipstick' },
    { name: 'Reliance', url: 'https://www.reliancedigital.in/search?q=phone' },
    { name: 'Meesho', url: 'https://www.meesho.com/search?q=shirt' }
  ];

  for (const site of sites) {
    try {
      const { data } = await axios.get(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      console.log(`[${site.name}] Success! Length: ${data.length}`);
    } catch(e) {
      console.log(`[${site.name}] Error: ${e.message}`);
    }
  }
}
testAll();
