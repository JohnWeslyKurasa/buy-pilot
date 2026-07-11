const fs = require('fs');
const html = fs.readFileSync('yahoo.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

$('.algo-sr').each((i, el) => {
  console.log('--- RESULT', i, '---');
  console.log($(el).html().substring(0, 300));
});
