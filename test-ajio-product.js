const axios = require('axios');

async function test() {
  try {
    const { data } = await axios.get('https://www.ajio.com/nike-men-run-defy-running-shoes/p/460778683_black', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Success, length:', data.length);
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
