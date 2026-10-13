import sharp from "sharp";
const sources = [
  [
    "destination-colombo",
    "https://images.unsplash.com/photo-1775189688372-5791dd0bc3e2?auto=format&fit=max&w=1400&q=85",
  ],
  [
    "destination-kandy",
    "https://images.unsplash.com/photo-1749528745045-9af59da55d41?auto=format&fit=max&w=1400&q=85",
  ],
  [
    "destination-matara",
    "https://images.unsplash.com/photo-1765653285951-e0472509bb1f?auto=format&fit=max&w=1400&q=85",
  ],
];
for (const [name, url] of sources) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  await sharp(Buffer.from(await response.arrayBuffer()))
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(`public/images/${name}.webp`);
  console.log(`Saved ${name}`);
}
await sharp("research/assets/dilanka-fleet-enhanced.png")
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 90 })
  .toFile("public/images/dilanka-fleet-enhanced.webp");
await sharp("research/assets/dilanka-fleet-user-original.jpg")
  .resize({ width: 1400, withoutEnlargement: true })
  .webp({ quality: 86 })
  .toFile("public/images/dilanka-fleet-original.webp");
