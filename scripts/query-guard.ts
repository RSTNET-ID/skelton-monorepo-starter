import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const roots = ["apps/api/src/", "apps/api/database/", "apps/api/scripts/"];
export const eligible = (file: string): boolean =>
  roots.some((root) => file.startsWith(root)) && /\.(ts|sql)$/.test(file);

export type Finding = { line: number; rule: "select-wildcard" | "possible-n-plus-one"; message: string };

// Static guard is a heuristic, not a SQL parser or a substitute for query-count tests.
// Strip comments, preserve line boundaries, and scan SQL template contents across lines.
export function scanSource(source: string): Finding[] {
  const found: Finding[] = [];
  const lines = source.split(/\r?\n/);
  const uncommented = source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/(^|\n)\s*\/\/[^\n]*/g, (comment) => comment.replace(/[^\n]/g, " "));
  const pattern = /\bSELECT\s+(?:DISTINCT\s+)?(?:(?:[a-zA-Z_][\w]*\.)?\*|(?:[\w.]+\s*,\s*)+[a-zA-Z_][\w]*\.\*)(?=\s|,|FROM\b)/gi;
  for (const match of uncommented.matchAll(pattern)) {
    const line = uncommented.slice(0, match.index).split("\n").length;
    found.push({ line, rule: "select-wildcard", message: "SQL wildcard projection; explicitly name columns" });
  }
  // Flag high-confidence direct SQL inside an iteration for mandatory review.
  // False positives are possible; findings intentionally require refactoring or documented exception.
  for (let i = 0; i < lines.length; i++) {
    if (!/\b(for\s*\(|for\s+await\b|\.forEach\s*\()/.test(lines[i]!)) continue;
    const window = lines.slice(i, i + 12).join("\n");
    if (/\b(await\s+)?(?:db|sql|connection|repository)\s*(?:\.|\x60|\[)/.test(window) &&
        /\b(await|query|execute|findBy|findOne|fetch)\b/.test(window)) {
      found.push({ line: i + 1, rule: "possible-n-plus-one", message: "Potential query inside iteration; batch/load and add query-count test" });
    }
  }
  return found;
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "git failed");
  return result.stdout;
}

export function main(argv: string[]): number {
  const all = argv.includes("--all");
  const files = (all ? git(["ls-files", "-z"]) : git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]))
    .split("\0").filter(eligible);
  const violations: string[] = [];
  for (const file of files) {
    let text: string;
    try {
      text = all ? readFileSync(file, "utf8") : git(["show", ":" + file]);
    } catch { continue; }
    const findings = scanSource(text);
    // Only newly introduced source lines should block pre-commit. Existing findings are
    // surfaced by --all and are not retroactively enforced on unrelated edits.
    let added: Set<number> | undefined;
    if (!all) {
      added = new Set<number>();
      const diff = git(["diff", "--cached", "--unified=0", "--", file]);
      let newLine = 0;
      for (const line of diff.split("\n")) {
        const header = line.match(/^@@.*\+(\d+)(?:,(\d+))?\s+@@/);
        if (header) { newLine = Number(header[1]); continue; }
        if (line.startsWith("+") && !line.startsWith("+++")) { added.add(newLine); newLine++; }
        else if (line.startsWith(" ")) newLine++;
      }
    }
    for (const finding of findings) {
      // Multiline SQL wildcard can start on an unchanged line before the staged change;
      // a conservative 8-line window catches SELECT ... newline * modifications.
      const touched = all || [...(added ?? [])].some((line) => Math.abs(line - finding.line) <= 8);
      if (touched) violations.push(file + ":" + finding.line + " [" + finding.rule + "] " + finding.message);
    }
  }
  for (const item of violations) console.error(item);
  if (violations.length) {
    console.error("query-guard: " + violations.length + " finding(s). N+1 still requires runtime query-count tests.");
    return 1;
  }
  console.log("query-guard passed; " + files.length + " files checked. This is not proof of N+1 absence.");
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
