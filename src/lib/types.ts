export type Stop = { name: string; offset: number; location: string };
export type Bus = {
  id: string;
  name: string;
  registration: string;
  capacity: number;
  layout: number[][];
  amenities: string[];
};
export type Route = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  via: string;
  stops: Stop[];
  duration: number;
  departure: string;
  fare: number;
  busId: string;
  source: string;
};
export type Trip = {
  id: string;
  route_id: string;
  bus_id: string;
  departure: string;
  arrival: string;
  fare: number;
  fee: number;
  status: string;
  route: Route;
  bus: Bus;
  available: number;
  booked: number[];
  blocked: number[];
  held: number[];
};
export type Ticket = {
  id: string;
  seat: number;
  passenger: string;
  status: string;
  checked_in_at: string | null;
  qr_token?: string;
};
export type Booking = {
  id: string;
  reference: string;
  status: string;
  payment_status: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  dropoff: string;
  total: number;
  fare: number;
  fee: number;
  created_at: string;
  trip: Trip;
  tickets: Ticket[];
  access_code?: string;
};
export const money = (n: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n / 100);
export const time = (v: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(v));
export const dateLabel = (v: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(v));
export const sriDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
