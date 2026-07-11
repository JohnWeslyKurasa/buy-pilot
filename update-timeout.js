const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');
const files = fs.readdirSync(providersDir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(providersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/timeout:\s*12000/g, 'timeout: 25000');
    fs.writeFileSync(filePath, content);
  }
}
console.log('Timeout increased to 25000 for all providers.');
