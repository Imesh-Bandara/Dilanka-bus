import fs from 'node:fs';
const p='src/components/staff.tsx';let s=fs.readFileSync(p,'utf8');s=s.replaceAll('<Modal\n','<Modal error={error}\n').replaceAll('<Modal title=','<Modal error={error} title=');fs.writeFileSync(p,s);
