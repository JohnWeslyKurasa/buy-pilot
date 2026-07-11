const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  const { data } = await axios.get("https://search.yahoo.com/search?p=site:croma.com+laptop", {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  
  const $ = cheerio.load(data);
  const results = $('.algo-sr');
  
  console.log("Found", results.length, "results");
  
  results.each((i, el) => {
    if (i > 2) return;
    console.log("--- Result", i);
    console.log("HTML:", $(el).html().substring(0, 300));
    console.log("Last text node:", $(el).find('.compTitle a').contents().last().text().trim());
  });
}
run();
