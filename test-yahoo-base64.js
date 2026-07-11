const fs = require('fs');

const html = fs.readFileSync('yahoo.html', 'utf8');
const matches = html.match(/data:image[^"']+/g);

if (matches) {
  console.log(`Found ${matches.length} base64 images.`);
  console.log(matches.slice(0, 3).map(m => m.substring(0, 50)));
} else {
  console.log('No base64 images found.');
}
