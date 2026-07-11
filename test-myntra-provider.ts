import { MyntraProvider } from './src/lib/providers/MyntraProvider';

async function main() {
  const provider = new MyntraProvider();
  const result = await provider.search("running shoes");
  console.log(JSON.stringify(result, null, 2));
}

main();
