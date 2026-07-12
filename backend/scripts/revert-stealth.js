const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');
const files = fs.readdirSync(providersDir);

const badImport = 'import puppeteer from "puppeteer-extra";\\nimport StealthPlugin from "puppeteer-extra-plugin-stealth";\\npuppeteer.use(StealthPlugin());';
const goodImport = 'import puppeteer from "puppeteer";';

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(providersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace puppeteer import
    content = content.replace(
      'import puppeteer from "puppeteer-extra";\nimport StealthPlugin from "puppeteer-extra-plugin-stealth";\npuppeteer.use(StealthPlugin());',
      'import puppeteer from "puppeteer";'
    );
    fs.writeFileSync(filePath, content);
  }
}

// Also update route.ts
const routePath = path.join(__dirname, 'src', 'app', 'api', 'search', 'route.ts');
if (fs.existsSync(routePath)) {
  let content = fs.readFileSync(routePath, 'utf-8');
  content = content.replace(
    'import puppeteer from "puppeteer-extra";\nimport StealthPlugin from "puppeteer-extra-plugin-stealth";\npuppeteer.use(StealthPlugin());',
    'import puppeteer from "puppeteer";'
  );
  fs.writeFileSync(routePath, content);
}

console.log('Reverted stealth plugin.');
