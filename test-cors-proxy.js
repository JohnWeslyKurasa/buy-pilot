const axios = require('axios');

async function testProxy() {
  try {
    const targetUrl = 'https://www.ajio.com/search/?text=running%20shoes';
    const { data } = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
    console.log('Success, length:', data.contents.length);
    if (data.contents.includes('Access Denied') || data.contents.includes('403 Forbidden')) {
       console.log('Still blocked via proxy.');
    } else {
       console.log('Proxy bypassed bot protection!');
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
testProxy();
