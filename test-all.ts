import { AjioProvider } from './src/lib/providers/AjioProvider';
import { CromaProvider } from './src/lib/providers/CromaProvider';
import { MyntraProvider } from './src/lib/providers/MyntraProvider';
import { NykaaProvider } from './src/lib/providers/NykaaProvider';
import { RelianceProvider } from './src/lib/providers/RelianceProvider';
import { MeeshoProvider } from './src/lib/providers/MeeshoProvider';
import puppeteer from 'puppeteer';

async function main() {
  const providers = [
    new AjioProvider(),
    new CromaProvider(),
    new MyntraProvider(),
    new NykaaProvider(),
    new RelianceProvider(),
    new MeeshoProvider()
  ];
  
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
  
  for (const provider of providers) {
    console.log(`Testing ${provider.name}...`);
    try {
      const result = await provider.search("running shoes", browser);
      console.log(`- ${provider.name} found ${result.products.length} products`);
      if (result.error) console.log(`- Error: ${result.error}`);
    } catch (e) {
      console.log(`- Exception: ${e.message}`);
    }
  }
  
  await browser.close();
}
main();
