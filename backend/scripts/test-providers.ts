import { NykaaProvider } from './src/lib/providers/NykaaProvider';
import { RelianceProvider } from './src/lib/providers/RelianceProvider';
import { CromaProvider } from './src/lib/providers/CromaProvider';
import { MeeshoProvider } from './src/lib/providers/MeeshoProvider';
import { AjioProvider } from './src/lib/providers/AjioProvider';

async function test() {
  console.log("Testing Nykaa...");
  const nykaa = new NykaaProvider();
  const nRes = await nykaa.search("lipstick");
  console.log("Nykaa:", nRes.products.length, nRes.products[0]?.title);

  console.log("Testing Reliance...");
  const rel = new RelianceProvider();
  const rRes = await rel.search("iphone");
  console.log("Reliance:", rRes.products.length, rRes.products[0]?.title);

  console.log("Testing Croma...");
  const croma = new CromaProvider();
  const cRes = await croma.search("laptop");
  console.log("Croma:", cRes.products.length, cRes.products[0]?.title);

  console.log("Testing Meesho...");
  const meesho = new MeeshoProvider();
  const mRes = await meesho.search("saree");
  console.log("Meesho:", mRes.products.length, mRes.products[0]?.title);
}

test();
