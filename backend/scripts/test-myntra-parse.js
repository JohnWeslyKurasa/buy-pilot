const axios = require('axios');
const cheerio = require('cheerio');

async function testMyntra() {
  try {
    const { data } = await axios.get('https://www.myntra.com/running-shoes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    // Myntra injects search data inside <script> tags
    const scriptMatch = data.match(/window\\.__myx\\s*=\\s*({.*?});/);
    if (scriptMatch) {
      const parsed = JSON.parse(scriptMatch[1]);
      const products = parsed?.searchData?.results?.products || [];
      console.log('Myntra Products Found:', products.length);
      products.slice(0,3).forEach(p => {
         console.log({ title: p.productName, price: p.price, img: p.searchImage });
      });
    } else {
      console.log('No __myx found, testing searchData');
      const searchDataMatch = data.match(/"products":\\[(.*?)\\]/);
      if (searchDataMatch) {
         console.log('Found products array string, length:', searchDataMatch[0].length);
      }
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testMyntra();
