import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base='http://localhost:3000';
async function request(path,body,options={}){const response=await fetch(`${base}/api/${path}`,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...options.headers},body:body?JSON.stringify(body):undefined});return {response,data:response.headers.get('content-type')?.includes('application/json')?await response.json():await response.arrayBuffer()};}
const creds=await fs.readFile('.data/staff-access.txt','utf8');const passwords=[...creds.matchAll(/Password: (.+)/g)].map(m=>m[1].trim());
assert.equal((await request('staff/data')).response.status,401);
assert.equal((await request('staff/seed')).response.status,405);
assert.equal((await request('staff/login',{username:'admin',password:'incorrect'})).response.status,401);
const login=await request('staff/login',{username:'admin',password:passwords[0]});assert.equal(login.response.status,200);const cookie=login.response.headers.get('set-cookie').split(';')[0],auth={headers:{cookie}};
const data=(await request('staff/data',null,auth)).data;assert.equal(data.role,'admin');assert.ok(data.trips.length>0);
const route=data.routes.find(r=>r.id==='colombo-ampara-kandy'),bus=data.buses.find(b=>b.id==='demo51');const departure=new Date(Date.now()+4*3600000).toISOString(),arrival=new Date(Date.now()+13*3600000).toISOString();
assert.equal((await request('staff/trip',{routeId:route.id,busId:bus.id,departure,arrival,fare:269500,fee:10000,status:'open'},auth)).response.status,200);
const updated=(await request('staff/data',null,auth)).data;const trip=updated.trips.find(t=>t.departure===departure);assert.ok(trip);
const owner=randomUUID(),h=await request('holds',{tripId:trip.id,seats:[1,2],owner});assert.equal(h.response.status,201);
const input={holdId:h.data.id,owner,idempotency:randomUUID(),name:'HTTP Demo Traveller',phone:'0771234567',email:'',pickup:'Colombo',dropoff:'Ampara',passengers:[{seat:1,name:'HTTP Demo Traveller'},{seat:2,name:'HTTP Demo Companion'}],expectedTotal:559000};const confirmed=await request('bookings',input);assert.equal(confirmed.response.status,201);
const access={headers:{'x-booking-access':confirmed.data.accessCode}};assert.equal((await request(`bookings/${confirmed.data.id}`)).response.status,404);const b=(await request(`bookings/${confirmed.data.id}`,null,access)).data;assert.equal(b.tickets.length,2);assert.equal(b.qrImages.length,2);
const publicTicket=(await request(`verify/${b.tickets[0].qr_token}`)).data;assert.equal(publicTicket.valid,true);assert.equal('phone' in publicTicket,false);
const pdf=await request(`bookings/${b.id}/pdf`,null,access);assert.equal(pdf.response.status,200);assert.ok(pdf.data.byteLength>10000);await fs.writeFile('test-output/http-tickets.pdf',Buffer.from(pdf.data));
assert.equal((await request('staff/block',{tripId:trip.id,seat:1,blocked:true},auth)).response.status,409);
assert.equal((await request('staff/trip',{id:trip.id,routeId:route.id,busId:bus.id,departure,arrival,fare:269500,fee:10000,status:'closed'},auth)).response.status,409);
assert.equal((await request('staff/checkin',{token:b.tickets[0].qr_token,tripId:trip.id},auth)).response.status,200);assert.equal((await request('staff/checkin',{token:b.tickets[0].qr_token,tripId:trip.id},auth)).response.status,409);
assert.equal((await request('staff/cancel',{id:b.id},auth)).response.status,409);
if(passwords[1]){const conductor=await request('staff/login',{username:'conductor',password:passwords[1]});assert.equal(conductor.response.status,200);const c={headers:{cookie:conductor.response.headers.get('set-cookie').split(';')[0]}};assert.equal((await request('staff/seed',{},c)).response.status,403);assert.equal((await request(`bookings/${b.id}/cancel`,{},c)).response.status,403);}
await fs.writeFile('test-output/http-summary.json',JSON.stringify({tripId:trip.id,bookingReference:b.reference,checks:'passed',qrValidationUrl:`${base}/verify/${b.tickets[0].qr_token}`},null,2));
console.log('HTTP smoke checks passed: staff auth and roles, method guard, departure creation, guest booking, private access, QR, PDF, blocked edits and repeat check-in.');
