import fs from 'node:fs';
const edit=(file,fn)=>fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));
edit('src/lib/service.ts',s=>s.replace('date?:string;from?:string;to?:string;all?:boolean','date?:string;from?:string;to?:string;all?:boolean;id?:string').replace('ORDER BY t.departure`,[filters.date||null]','AND ($2::text IS NULL OR t.id=$2) ORDER BY t.departure`,[filters.date||null,filters.id||null]').replace('trips({all:true})).find','trips({all:true,id})).find'));
edit('src/app/api/[...path]/route.ts',s=>s.replace('const b=await service.booking(decodeURIComponent(p[1]),access);','let staff=false;if(!access){try{await staffSession();staff=true;}catch{}}const b=await service.booking(decodeURIComponent(p[1]),access,staff);'));
edit('src/app/globals.css',s=>s+'\n@media(min-width:851px) and (max-width:1150px){.hero-copy h1{font-size:clamp(42px,4.8vw,55px)}}\n');
