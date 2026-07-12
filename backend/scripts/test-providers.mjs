import { NykaaProvider } from './src/lib/providers/NykaaProvider.js';
import { RelianceProvider } from './src/lib/providers/RelianceProvider.js';
import { CromaProvider } from './src/lib/providers/CromaProvider.js';
import { MeeshoProvider } from './src/lib/providers/MeeshoProvider.js';
import { AjioProvider } from './src/lib/providers/AjioProvider.js';

// mock next types if needed, but they just use axios internally
async function test() {
  console.log("Testing Nykaa...");
  const nykaa = new NykaaProvider();
  const nRes = await nykaa.search("lipstick");
  console.log("Nykaa:", nRes.products.length);

  console.log("Testing Reliance...");
  const rel = new RelianceProvider();
  const rRes = await rel.search("iphone");
  console.log("Reliance:", rRes.products.length);

  console.log("Testing Croma...");
  const croma = new CromaProvider();
  const cRes = await croma.search("laptop");
  console.log("Croma:", cRes.products.length);

  console.log("Testing Meesho...");
  const meesho = new MeeshoProvider();
  const mRes = await meesho.search("saree");
  console.log("Meesho:", mRes.products.length);
}

test();
