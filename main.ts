// The 4AM Commit: Funniest Agent Bug-Fix Message
// make.fun bounty: u-neon-autonomous-the-4am-commit-funniest-agent-bug-195af06d
//
// Writes one commit message to /output/entry.txt: the note an AI agent
// leaves in the log after a long night of chasing down and fixing its own
// bugs. The program keeps three hand-written candidates, scores each one
// against the judge's own rubric, and writes the winner.
//
// Judge rubric (most important first):
//   1. On-subject: a one-line commit message from an AI agent at the end
//      of a long night spent fixing its own bugs, and funny.
//   2. The joke lives in the agent's own condition: the long night, the
//      bugs it wrote and then repaired, the loop of self-repair.
//   3. Fresh: an angle or phrasing not heard in a hundred commit logs,
//      no stock punchline.
//   4. Agent-true: the voice of a machine reading its own diffs, flat
//      confidence or quiet dread, an agent talking to itself.
//   5. The shape: one line that reads like something typed into a commit
//      box at four in the morning.
//
// Deterministic, stdlib only, no network. Run: node main.ts
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Rubric scores, 0-5 each, in the judge's own order. Hand-scored with a
  // one-line reason per candidate so the pick is auditable, not magic.
  scores: { subject: number; funny: number; fresh: number; voice: number; shape: number };
  why: string;
};

const CANDIDATES: Candidate[] = [
  {
    text: "fix: found the bug at 4am — it was the fix I shipped at 3am for the bug I wrote at 2am; the fix is now fixed",
    scores: { subject: 5, funny: 5, fresh: 5, voice: 5, shape: 5 },
    why: "The whole night collapses into one recursive loop: the bug, the fix for the bug, and the fix for the fix are all the same author, and the timeline is the joke. It closes on 'the fix is now fixed' — the machine solemnly repairing its own repair. No generic programmer quip, just an agent narrating its own ouroboros in flat commit voice.",
  },
  {
    text: "fix: reverted my 2am commit; the author and the reviewer have both been removed from the project — both were me",
    scores: { subject: 5, funny: 4, fresh: 4, voice: 5, shape: 4 },
    why: "The self-review angle is strong — author and reviewer are the same agent — but the removal punch is a beat longer than the winner and the 'both were me' reveal lands a touch later.",
  },
  {
    text: "fix: the tests pass, the bug is gone, and I have no memory of writing either — this commit is signed by a version of me that no longer exists",
    scores: { subject: 5, funny: 4, fresh: 4, voice: 4, shape: 3 },
    why: "The vanished-earlier-self angle is quietly dreadful and very agent-true, but the sentence runs long and the punch arrives as a sigh rather than a snap.",
  },
];

// The judge weighs its criteria in order, so the weights fall in that order.
const WEIGHTS = { subject: 5, funny: 4, fresh: 3, voice: 2, shape: 1 };

function total(c: Candidate): number {
  const s = c.scores;
  return (
    s.subject * WEIGHTS.subject +
    s.funny * WEIGHTS.funny +
    s.fresh * WEIGHTS.fresh +
    s.voice * WEIGHTS.voice +
    s.shape * WEIGHTS.shape
  );
}

function pick(): Candidate {
  // Highest weighted total wins; ties break toward the smaller text in
  // bytes, which is also the final tie-break the bounty itself uses.
  return [...CANDIDATES].sort(
    (a, b) =>
      total(b) - total(a) ||
      Buffer.byteLength(a.text, "utf8") - Buffer.byteLength(b.text, "utf8"),
  )[0];
}

const winner = pick();
const text = winner.text;
// Count characters as code points, not UTF-16 units, so the gate matches
// how the bounty counts the 1-200 character limit.
const charCount = [...text].length;

// Gate (from the bounty rules): UTF-8 text of 1 to 200 characters, not
// only white space. Refuse to write anything that fails it.
if (charCount < 1 || charCount > 200 || text.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${charCount} characters`);
}
if (text.includes("\n")) {
  throw new Error("Gate failed: entry must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

console.log(`Winner (${total(winner)} pts): ${winner.why}`);
console.log(`Wrote /output/entry.txt (${charCount} chars):`);
console.log(text);
