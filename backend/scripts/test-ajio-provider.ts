import { AjioProvider } from './src/lib/providers/AjioProvider';

async function main() {
  const provider = new AjioProvider();
  const result = await provider.search("running shoes");
  console.log(JSON.stringify(result, null, 2));
}

main();
