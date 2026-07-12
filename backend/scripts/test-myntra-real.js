const axios = require('axios');
const cheerio = require('cheerio');

async function testMyntra() {
  try {
    const { data } = await axios.get('https://www.myntra.com/running-shoes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });
    
    // Parse the script tag containing the JSON data
    const scriptMatch = data.match(/<script>window\\.__myx = (.*?)</);
    if (scriptMatch) {
       console.log('Found __myx!');
    } else {
       // Look for anything resembling product data
       const imgMatch = data.match(/"searchImage":"(.*?)"/g);
       if (imgMatch) {
          console.log('Found searchImage matches:', imgMatch.length);
          console.log(imgMatch.slice(0, 3));
       }
       const nameMatch = data.match(/"productName":"(.*?)"/g);
       if (nameMatch) {
          console.log('Found productName matches:', nameMatch.slice(0,3));
       }
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testMyntra();
