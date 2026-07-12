const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');

const brokenProviders = [
  'AjioProvider.ts',
  'CromaProvider.ts',
  'NykaaProvider.ts',
  'RelianceProvider.ts',
  'MeeshoProvider.ts',
  'MyntraProvider.ts'
];

for (const file of brokenProviders) {
  const filePath = path.join(providersDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find "return validItems.slice(0, 5);"
  // Replace everything from there to "products.forEach" with the correct syntax
  
  const start = content.indexOf('return validItems.slice(0, 5);');
  const end = content.indexOf('products.forEach((item: any) => {');
  
  if (start !== -1 && end !== -1) {
    const newMiddle = 'return validItems.slice(0, 5);\n      });\n\n      const parsedProducts: Product[] = [];\n      ';
    content = content.substring(0, start) + newMiddle + content.substring(end);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Fixed syntax robustly.');
