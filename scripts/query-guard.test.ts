import { describe, expect, test } from "bun:test";
import { scanSource } from "./query-guard";

describe("SQL quality guard", () => {
  test("rejects SELECT * with newlines", () => {
    expect(scanSource("await sql\x60SELECT\n  *\nFROM users\x60").some((f) => f.rule === "select-wildcard")).toBe(true);
  });
  test("rejects aliased star and distinct star", () => {
    expect(scanSource("SELECT DISTINCT u.* FROM users u").some((f) => f.rule === "select-wildcard")).toBe(true);
  });
  test("allows explicit projections and COUNT(*)", () => {
    expect(scanSource("SELECT u.user_id, u.email FROM users u; SELECT COUNT(*) FROM users")).toEqual([]);
  });
  test("ignores commented wildcard", () => {
    expect(scanSource("-- no SQL parser here\n// SELECT * FROM users\n/* SELECT * FROM users */")).toEqual([]);
  });
  test("flags plausible per-row repository query", () => {
    const src = "for (const user of users) {\n  await repository.findById(user.user_id);\n}";
    expect(scanSource(src).some((f) => f.rule === "possible-n-plus-one")).toBe(true);
  });
});
