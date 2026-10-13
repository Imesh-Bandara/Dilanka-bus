import fs from 'node:fs';
const p='src/components/public-pages.tsx';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('/images/fleet.png','/images/fleet.webp'));
