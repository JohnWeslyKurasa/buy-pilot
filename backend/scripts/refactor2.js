const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');
const files = fs.readdirSync(providersDir);
const oldStr = '"--no-sandbox", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"';
const newStr = '"--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"';

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(providersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.split(oldStr).join(newStr);
    fs.writeFileSync(filePath, content);
  }
}

// Also update route.ts
const routePath = path.join(__dirname, 'src', 'app', 'api', 'search', 'route.ts');
if (fs.existsSync(routePath)) {
  let content = fs.readFileSync(routePath, 'utf-8');
  content = content.split(oldStr).join(newStr);
  fs.writeFileSync(routePath, content);
}

console.log('Added --disable-blink-features=AutomationControlled to all files.');
