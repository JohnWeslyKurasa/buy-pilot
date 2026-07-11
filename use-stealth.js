const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');
const files = fs.readdirSync(providersDir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(providersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace puppeteer import
    if (content.includes('import puppeteer from "puppeteer";')) {
      content = content.replace(
        'import puppeteer from "puppeteer";',
        'import puppeteer from "puppeteer-extra";\nimport StealthPlugin from "puppeteer-extra-plugin-stealth";\npuppeteer.use(StealthPlugin());'
      );
      fs.writeFileSync(filePath, content);
    }
  }
}

// Also update route.ts
const routePath = path.join(__dirname, 'src', 'app', 'api', 'search', 'route.ts');
if (fs.existsSync(routePath)) {
  let content = fs.readFileSync(routePath, 'utf-8');
  if (content.includes('import puppeteer from "puppeteer";')) {
    content = content.replace(
      'import puppeteer from "puppeteer";',
      'import puppeteer from "puppeteer-extra";\nimport StealthPlugin from "puppeteer-extra-plugin-stealth";\npuppeteer.use(StealthPlugin());'
    );
    fs.writeFileSync(routePath, content);
  }
}

console.log('Stealth plugin added to all files.');
