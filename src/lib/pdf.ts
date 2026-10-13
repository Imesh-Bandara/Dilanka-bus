import "regenerator-runtime/runtime";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { type Booking, dateLabel, time, money } from "./types";
export async function ticketPdf(b: Booking, base: string, arrivalMinutes = 30) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold),
    si = await pdf.embedFont(
      await fs.readFile(path.join(process.cwd(), "public/fonts/sinhala.woff")),
      { subset: true },
    ),
    ta = await pdf.embedFont(
      await fs.readFile(path.join(process.cwd(), "public/fonts/tamil.woff")),
      { subset: true },
    );
  const draw = (
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size = 14,
    max = 270,
  ) => {
    const runs = (
      text.match(
        /[\u0D80-\u0DFF\u200C\u200D]+|[\u0B80-\u0BFF]+|[^\u0D80-\u0DFF\u0B80-\u0BFF\u200C\u200D]+/g,
      ) || []
    ).map((run) => ({
      text: /[\u0D80-\u0DFF]/.test(run)
        ? run
        : /[\u0B80-\u0BFF]/.test(run)
          ? run
          : run.replace(/[^\x20-\x7E]/g, " "),
      font: /[\u0D80-\u0DFF]/.test(run)
        ? si
        : /[\u0B80-\u0BFF]/.test(run)
          ? ta
          : bold,
    }));
    const width = runs.reduce(
      (sum, r) => sum + r.font.widthOfTextAtSize(r.text, size),
      0,
    );
    const scaled = Math.min(size, (size * max) / Math.max(1, width));
    for (const r of runs) {
      page.drawText(r.text, { x, y, size: scaled, font: r.font });
      x += r.font.widthOfTextAtSize(r.text, scaled);
    }
  };
  const boarding = b.trip.route.stops.find((s) => s.name === b.pickup);
  const dep = new Date(
    new Date(b.trip.departure).getTime() + (boarding?.offset || 0) * 60000,
  ).toISOString();
  for (const ticket of b.tickets) {
    const page = pdf.addPage([595, 842]);
    page.drawRectangle({
      x: 0,
      y: 700,
      width: 595,
      height: 142,
      color: rgb(0.09, 0.11, 0.1),
    });
    page.drawText("DILANKA EXPRESS", {
      x: 42,
      y: 782,
      size: 24,
      font: bold,
      color: rgb(0.77, 0.65, 0.34),
    });
    page.drawText("Your journey, thoughtfully connected.", {
      x: 42,
      y: 754,
      size: 11,
      font,
      color: rgb(1, 1, 1),
    });
    let y = 665;
    const line = (label: string, value: string) => {
      page.drawText(label.toUpperCase(), {
        x: 42,
        y,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
      draw(page, value, 42, y - 23);
      y -= 66;
    };
    line(
      "DEMO TICKET - NOT VALID FOR TRAVEL",
      b.status === "cancelled" ? "CANCELLED" : "No payment collected",
    );
    line("Journey", `${b.pickup} to ${b.dropoff}`);
    line("Boarding time", `${dateLabel(dep)} at ${time(dep)}`);
    line("Passenger", ticket.passenger);
    line("Seat / vehicle", `${ticket.seat} / ${b.trip.bus.registration}`);
    line("Booking reference", b.reference);
    line("Ticket fare including service fee", money(b.fare + b.fee));
    const qr = await QRCode.toBuffer(`${base}/verify/${ticket.qr_token}`, {
      width: 600,
      margin: 4,
      errorCorrectionLevel: "M",
    });
    const image = await pdf.embedPng(qr);
    page.drawImage(image, { x: 350, y: 350, width: 200, height: 200 });
    page.drawText("Scan to verify this demo ticket", {
      x: 356,
      y: 332,
      size: 10,
      font,
    });
    page.drawText("Hotline: 0777 914680 / 0777 205634", {
      x: 42,
      y: 110,
      size: 11,
      font,
    });
    page.drawText(
      `Please arrive ${arrivalMinutes} minutes before your boarding time.`,
      {
        x: 42,
        y: 85,
        size: 10,
        font,
      },
    );
  }
  return Buffer.from(await pdf.save());
}
