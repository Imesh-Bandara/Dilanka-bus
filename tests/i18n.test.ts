import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { translate } from "../src/lib/i18n";
import catalog from "../src/lib/locales/catalog.json";
import { routes, buses } from "../src/lib/seed";

test("both languages cover every explicit UI message; codes and brands remain stable", () => {
  const exempt = new Set([
    "you@example.com",
    "DE",
    "DE-XXXXXXXXXX",
    "dilankaexpress@gmail.com",
    "DE / 01",
    "EN",
    "Facebook",
    "DEMO-NEW",
  ]);
  for (const file of fs
    .readdirSync("src/components")
    .filter((f) => f.endsWith(".tsx"))) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync("src/components/" + file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(source) === "tr" &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const text = node.arguments[0].text.trim();
        if (/[A-Za-z]/.test(text) && !exempt.has(text))
          for (const lang of ["si", "ta"] as const)
            assert.notEqual(
              translate(text, lang),
              text,
              `${file}: ${lang}: ${text}`,
            );
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  for (const [key, entry] of Object.entries(catalog))
    for (const lang of ["si", "ta"] as const)
      assert.match(
        entry[lang],
        lang === "si" ? /[\u0d80-\u0dff]/ : /[\u0b80-\u0bff]/,
        `${key}: ${lang}`,
      );
});
test("all seeded towns, coach labels, amenities and stop descriptions are localized without changing IDs", () => {
  for (const lang of ["si", "ta"] as const) {
    for (const r of routes)
      for (const text of [
        r.origin,
        r.destination,
        r.via,
        r.name,
        ...r.stops.flatMap((s) => [s.name, s.location]),
      ])
        assert.notEqual(translate(text, lang), text, `${lang}: ${text}`);
    for (const b of buses)
      for (const text of [b.name, ...b.amenities])
        assert.notEqual(translate(text, lang), text);
    for (const value of [
      "DE-ABC1234567",
      "NE-3230",
      "https://example.com/verify/token",
      "0771234567",
      "Passenger Test",
    ])
      assert.equal(translate(value, lang), value);
  }
});
test("variable messages preserve counts and localize their surrounding text", () => {
  for (const lang of ["si", "ta"] as const) {
    for (const text of [
      "issued",
      "checked in",
      "cancelled",
      "expired",
      "Seats held for 3:42",
      "Continue with 6 seats",
      "Seat 7, temporarily held",
      "Passenger for seat 7",
      "Passenger 2 name",
      "Seat 7 checked in successfully.",
      "Please arrive 45 minutes before your boarding time.",
    ]) {
      const result = translate(text, lang);
      assert.notEqual(result, text);
      assert.deepEqual(result.match(/\d+/g), text.match(/\d+/g));
    }
    for (const text of ["14 Oct 2026", "11:30 pm", "LKR 3,095", "6h 30m"])
      assert.notEqual(translate(text, lang), text);
  }
  assert.equal(translate("Seats held for 3:42", "en"), "Seats held for 3:42");
  assert.equal(translate("අම්පාර", "ta"), "අම්පාර"); // Never translate passenger-entered native text.
});
