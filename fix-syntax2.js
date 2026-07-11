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
  content = content.replace(
    '        return validItems.slice(0, 5);\n      });\n      });\n\n      const parsedProducts: Product[] = [];\n      \n      const parsedProducts: Product[] = [];',
    '        return validItems.slice(0, 5);\n      });\n\n      const parsedProducts: Product[] = [];'
  );
  content = content.replace(
    '        return validItems.slice(0, 5);\r\n      });\r\n      });\r\n\r\n      const parsedProducts: Product[] = [];\r\n      \r\n      const parsedProducts: Product[] = [];',
    '        return validItems.slice(0, 5);\r\n      });\r\n\r\n      const parsedProducts: Product[] = [];'
  );
  fs.writeFileSync(filePath, content);
}
console.log('Syntax fixed.');
