const axios = require('axios');
const cheerio = require('cheerio');

async function testReliance() {
  try {
    const { data } = await axios.get('https://www.reliancedigital.in/search?q=phone', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });
    
    // Parse reliance
    const titleMatch = data.match(/"name":"(.*?)"/g);
    if (titleMatch) {
       console.log('Found names:', titleMatch.slice(0,3));
    }
    const imgMatch = data.match(/"image":"(.*?)"/g);
    if (imgMatch) {
       console.log('Found images:', imgMatch.slice(0,3));
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testReliance();
