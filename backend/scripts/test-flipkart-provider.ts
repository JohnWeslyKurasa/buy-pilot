import { FlipkartProvider } from './src/lib/providers/FlipkartProvider';

async function main() {
  const provider = new FlipkartProvider();
  const result = await provider.search("running shoes");
  console.log(JSON.stringify(result, null, 2));
}

main();
