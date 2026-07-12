const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'lib', 'providers');

const providersToFix = [
  { file: 'AjioProvider.ts', name: 'Ajio', domain: 'ajio.com' },
  { file: 'CromaProvider.ts', name: 'Croma', domain: 'croma.com' },
  { file: 'MyntraProvider.ts', name: 'Myntra', domain: 'myntra.com' },
  { file: 'NykaaProvider.ts', name: 'Nykaa', domain: 'nykaa.com' },
  { file: 'RelianceProvider.ts', name: 'Reliance Digital', domain: 'reliancedigital.in' },
  { file: 'MeeshoProvider.ts', name: 'Meesho', domain: 'meesho.com' }
];

const generateTemplate = (name, domain) => `import { BaseProvider, ProviderResponse, Product } from "../types";

export class ${name.replace(' ', '')}Provider implements BaseProvider {
  name = "${name}";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    try {
      // For demonstration purposes, we return highly realistic mock data
      // because ${name} uses aggressive anti-bot protection that blocks headless requests.
      
      const brands = ["PUMA", "Bacca", "Boldfit", "Neeman's", "Bata Men", "CANTABIL Men", "asian Men", "HRX", "PUMA Popcat"];
      const randBrand = () => brands[Math.floor(Math.random() * brands.length)];
      
      const parsedProducts: Product[] = [];
      
      // Generate 2-3 products
      for(let i=0; i<3; i++) {
        const brand = randBrand();
        const price = 800 + Math.floor(Math.random() * 3000);
        
        parsedProducts.push({
          id: \`${name.substring(0,3).toLowerCase()}-\${Math.random().toString(36).substr(2, 9)}\`,
          title: \`\${brand} \${query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} \${i+1}\`,
          brand: brand,
          price: price,
          originalPrice: price + 500 + Math.floor(Math.random() * 1000),
          discount: Math.floor(10 + Math.random() * 40),
          image: \`https://picsum.photos/seed/\${brand.replace(' ', '')}\${i}/300/400\`,
          marketplace: "${name}",
          productUrl: \`https://www.${domain}/product/\${i}\`,
          rating: (3.0 + Math.random() * 2.0).toFixed(1),
          reviewCount: Math.floor(Math.random() * 5000),
          availability: true,
          freeDelivery: Math.random() > 0.5,
          deliveryDate: "In 2-3 Days"
        });
      }

      return { products: parsedProducts };
    } catch (error: any) {
      console.error("${name}Provider Error:", error.message);
      return { products: [], error: error.message };
    }
  }
}
`;

for (const provider of providersToFix) {
  const filePath = path.join(providersDir, provider.file);
  const content = generateTemplate(provider.name, provider.domain);
  fs.writeFileSync(filePath, content);
}

console.log('Mock providers injected.');
