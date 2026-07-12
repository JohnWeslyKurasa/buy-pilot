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

const universalEvaluate = `      const products = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(i => {
           const rect = i.getBoundingClientRect();
           return rect.width > 50 && rect.height > 50;
        });
        const validItems = [];
        const seenLinks = new Set();

        for (const img of imgs) {
          let container = img.parentElement;
          let priceMatch = null;
          let linkEl = null;

          while (container && container !== document.body) {
             if (container.tagName === 'A' && !linkEl) linkEl = container;
             const text = container.innerText || "";
             const pMatch = text.match(/(?:₹|Rs\\.?)\\s*([0-9,]+)/i);
             if (pMatch) {
               priceMatch = pMatch;
               if (!linkEl) {
                  linkEl = container.querySelector('a');
               }
               break;
             }
             container = container.parentElement;
          }

          if (priceMatch && linkEl && linkEl.href) {
             if (seenLinks.has(linkEl.href)) continue;
             seenLinks.add(linkEl.href);

             const title = img.getAttribute('alt') || linkEl.innerText.split('\\n')[0] || "Product";
             let image = img.getAttribute('src') || img.getAttribute('data-src') || img.currentSrc;
             if (image && image.includes('data:image')) {
                // Try to find a better image source if it's a placeholder
                image = img.getAttribute('srcset') ? img.getAttribute('srcset').split(' ')[0] : image;
             }

             validItems.push({
               title: title.trim().substring(0, 100),
               priceStr: priceMatch[0],
               image: image,
               link: linkEl.href
             });
          }
        }
        return validItems.slice(0, 5);
      });`;

for (const file of brokenProviders) {
  const filePath = path.join(providersDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the block: const products = await page.evaluate(() => { ... });
  const startIndex = content.indexOf('const products = await page.evaluate(() => {');
  if (startIndex === -1) continue;
  
  const endIndex = content.indexOf('});', startIndex);
  if (endIndex === -1) continue;
  
  // Replace the evaluate block
  const before = content.substring(0, startIndex);
  let after = content.substring(endIndex + 3);
  
  // We also need to fix the parsing logic below because we simplified the returned objects
  const parsedStart = after.indexOf('products.forEach((item: any) => {');
  const parsedEnd = after.indexOf('return { products: parsedProducts };');
  
  let marketplace = file.replace('Provider.ts', '');
  
  const newParsingLogic = `
      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title && item.priceStr && item.image && item.link) {
          const price = parseInt(item.priceStr.replace(/[^0-9]/g, ""), 10);
          
          parsedProducts.push({
            id: \`${marketplace.substring(0,3).toLowerCase()}-\${Math.random().toString(36).substr(2, 9)}\`,
            title: item.title,
            brand: item.title.split(" ")[0] || "Unknown",
            price,
            image: item.image,
            marketplace: "${marketplace}",
            productUrl: item.link.startsWith("http") ? item.link : \`https://www.\${"${marketplace}".toLowerCase()}.com\${item.link}\`,
            availability: true,
          });
        }
      });

      `;
      
  after = after.substring(0, parsedStart) + newParsingLogic + after.substring(parsedEnd);
  
  fs.writeFileSync(filePath, before + universalEvaluate + after);
}
console.log('Universal scraper applied!');
