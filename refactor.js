const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');
const files = fs.readdirSync(providersDir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(providersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(
      'browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });',
      'browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });'
    );
    fs.writeFileSync(filePath, content);
  }
}
console.log('User-Agent added to all providers.');
