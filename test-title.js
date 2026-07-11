const titles = [
  "Cromahttps://www.croma.com › computers-tablets › LaptopsLaptops: Buy Latest Laptop Models Online at Best Price | Croma",
  "Reliance Digitalhttps://www.reliancedigital.in › smartphones › Apple iPhone 15",
  "www.ajio.com › men-sneakers Puma Men Sneakers",
];

for (const t of titles) {
  let cleaned = t.replace(/^.*?https?:\/\/[^\s]+(?:\s*[›>]\s*[^\s]+)*\s*/i, '').trim();
  cleaned = cleaned.replace(/^.*?www\.[^\s]+(?:\s*[›>]\s*[^\s]+)*\s*/i, '').trim();
  
  // Clean special chars except spaces/hyphens
  cleaned = cleaned.replace(/[^a-zA-Z0-9 \-]/g, '').trim();
  
  console.log("Original:", t);
  console.log("Cleaned:", cleaned);
  console.log("---");
}
