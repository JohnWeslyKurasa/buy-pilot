const axios = require('axios');
const cheerio = require('cheerio');

async function testUrl(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 5000
    });
    const $ = cheerio.load(data);
    const image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    console.log("Success for", url);
    console.log("Image found:", image);
  } catch (e) {
    console.log("Failed for", url, e.message);
  }
}

async function run() {
  await testUrl("https://www.croma.com/apple-macbook-air-m2-chip-macos-ic-2022-8gb-ram-256gb-ssd-mac-os-monterey-13-6-inch-liquid-retina-display-starlight-mlqy3hn-a-/p/256616");
  await testUrl("https://www.reliancedigital.in/apple-iphone-15-128-gb-black/p/493839308");
}
run();
