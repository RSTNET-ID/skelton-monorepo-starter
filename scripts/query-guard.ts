import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const all = process.argv.includes("--all");
const paths = ["apps/api/src/", "apps/api/database/", "apps/api/scripts/"];
const acceptable = (p: string) => paths.some(prefix => p.startsWith(prefix)) && /\.(ts|sql)$/.test(p);
function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "git failed");
  return result.stdout;
}
type Finding = { file: string; line: number; issue: string };
const findings: Finding[] = [];
let scanned = 0;
const selectStar = /\bSELECT\s+(?:DISTINCT\s+)?(?:[a-zA-Z_][\w]*\.)?\*(?=\s|,|FROM\b)/i;
const aliasStar = /\bSELECT\b[^;\n]*\b[a-zA-Z_][\w]*\.\*(?=\s|,|FROM\b)/i;
function inspect(file: string, line: number, sql: string): void {
  // COUNT(*) and EXISTS(SELECT 1) are permitted.
  const compact = sql.replace(/\s+/g, " ");
  if (selectStar.test(compact) || aliasStar.test(compact)) {
    findings.push({ file, line, issue: "SELECT wildcard projection (select explicit columns)" });
  }
}
if (all) {
  const files = git(["ls-files"]).split("\n").filter(acceptable);
  for (const file of files) {
    let data: string;
    try { data = readFileSync(file, "utf8"); } catch { continue; }
    scanned++;
    // Detect multiline SELECT list beginning with a wildcard on its next line.
    const lines = data.split("\n");
    for (let i = 0; i < lines.length; i++) {
      inspect(file, i + 1, lines.slice(i, i + 5).join(" "));
    }
  }
} else {
  // Only added/modified staged lines; avoids blocking historical SQL before refactoring.
  const diff = git(["diff", "--cached", "--unified=3", "--", "apps/api"]);
  let file = "", newLine = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("+++ b/")) { file = raw.slice(6); continue; }
    if (raw.startsWith("@@")) {
      const match = raw.match(/\+(\d+)/);
      if (match) newLine = Number(match[1]);
      continue;
    }
    if (raw.startsWith("+") && !raw.startsWith("+++")) {
      if (acceptable(file)) { scanned++; inspect(file, newLine, raw.slice(1)); }
      newLine++;
    } else if (raw.startsWith(" ")) newLine++;
  }
}
for (const f of findings) console.error(f.file + ":" + f.line + ": " + f.issue);
if (findings.length) {
  console.error("query-guard failed: " + findings.length + " forbidden SQL projection(s).");
  process.exit(1);
}
console.log("query-guard passed (" + scanned + " " + (all ? "files" : "staged lines") + " checked). N+1 requires query-count tests and review.");
