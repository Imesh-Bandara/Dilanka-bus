import sharp from 'sharp';
await sharp('public/images/fleet.png').webp({quality:85}).toFile('public/images/fleet.webp');
