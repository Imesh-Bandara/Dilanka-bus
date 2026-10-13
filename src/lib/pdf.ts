import "regenerator-runtime/runtime";
import { PDFDocument, StandardFonts, rgb, type PDFPage } from "pdf-lib";
import * as fontkit from "fontkit";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { type Booking, dateLabel, time, money } from "./types";
import { translate, type Language } from "./i18n";
export async function ticketPdf(
  b: Booking,
  base: string,
  arrivalMinutes = 30,
  lang: Language = "en",
) {
  const tr = (value: string) => translate(value, lang);
  const pdf = await PDFDocument.create();
  // pdf-lib expects the older streaming subset API. Fontkit 2 fixes Sinhala
  // independent-vowel shaping; this adapter preserves pdf-lib's subset contract.
  pdf.registerFontkit({
    create: (bytes: Uint8Array) => {
      const native = fontkit.create(Buffer.from(bytes));
      if (!("createSubset" in native))
        throw new Error("A single ticket font is required.");
      const subset = native.createSubset.bind(native);
      native.createSubset = () => {
        const value = subset();
        return Object.assign(value, {
          encodeStream: () => Readable.from([value.encode()]),
        });
      };
      return native;
    },
  } as unknown as Parameters<typeof pdf.registerFontkit>[0]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold),
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
    color = rgb(0, 0, 0),
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
      page.drawText(r.text, { x, y, size: scaled, font: r.font, color });
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
    draw(page, tr("DILANKA EXPRESS"), 42, 782, 24, 510, rgb(0.77, 0.65, 0.34));
    draw(
      page,
      tr("Your journey, thoughtfully connected."),
      42,
      748,
      11,
      510,
      rgb(1, 1, 1),
    );
    let y = 665;
    const line = (label: string, value: string) => {
      draw(page, tr(label).toUpperCase(), 42, y, 9, 270, rgb(0.4, 0.4, 0.4));
      draw(page, value, 42, y - 23);
      y -= 66;
    };
    line(
      "DEMO TICKET - NOT VALID FOR TRAVEL",
      tr(b.status === "cancelled" ? "CANCELLED" : "No payment collected"),
    );
    line("Journey", tr(`${b.pickup} to ${b.dropoff}`));
    line("Boarding time", `${tr(dateLabel(dep))} · ${tr(time(dep))}`);
    line("Passenger", ticket.passenger);
    line("Seat / vehicle", `${ticket.seat} / ${b.trip.bus.registration}`);
    line("Booking reference", b.reference);
    line("Ticket fare including service fee", tr(money(b.fare + b.fee)));
    const qr = await QRCode.toBuffer(`${base}/verify/${ticket.qr_token}`, {
      width: 600,
      margin: 4,
      errorCorrectionLevel: "M",
    });
    const image = await pdf.embedPng(qr);
    page.drawImage(image, { x: 350, y: 350, width: 200, height: 200 });
    draw(page, tr("Scan to verify this demo ticket"), 350, 325, 10, 200);
    draw(page, `${tr("Hotline")}: 0777 914680 / 0777 205634`, 42, 110, 11, 510);
    draw(
      page,
      tr(`Please arrive ${arrivalMinutes} minutes before your boarding time.`),
      42,
      85,
      10,
      510,
    );
  }
  return Buffer.from(await pdf.save());
}
