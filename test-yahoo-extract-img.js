const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('yahoo.html', 'utf8');
const $ = cheerio.load(html);

$('.algo-sr').each((i, el) => {
   const title = $(el).find('.compTitle a').text();
   const img = $(el).find('img').attr('src');
   console.log('Title:', title.substring(0, 30));
   console.log('Img:', img);
});
