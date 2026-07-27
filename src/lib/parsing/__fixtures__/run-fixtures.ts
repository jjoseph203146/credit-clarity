// Manual eyeball-check script — NOT a test framework (another task owns
// setting one up). Run with:
//
//   npx tsc --module commonjs --outDir /tmp/parsing-fixtures-out \
//     src/lib/parsing/__fixtures__/run-fixtures.ts \
//     src/lib/parsing/detect-bureau.ts src/lib/parsing/extract-score.ts \
//     src/lib/parsing/extract-accounts.ts \
//     src/lib/parsing/extract-collections.ts \
//     src/lib/parsing/extract-inquiries.ts \
//     --esModuleInterop --resolveJsonModule --skipLibCheck --target es2017
//   node /tmp/parsing-fixtures-out/src/lib/parsing/__fixtures__/run-fixtures.js
//
// (paths.ts "@/*" aliases aren't resolvable by plain tsc/node, so this
// script and its imports use relative paths only.)

import { detectBureau } from "../detect-bureau";
import { extractScore } from "../extract-score";
import { extractAccounts } from "../extract-accounts";
import { extractCollections } from "../extract-collections";
import { extractInquiries } from "../extract-inquiries";
import {
  EXPERIAN_SAMPLE,
  EQUIFAX_SAMPLE,
  UNRECOGNIZED_SAMPLE,
} from "./sample-reports";

const fixtures: Array<[string, string]> = [
  ["EXPERIAN_SAMPLE", EXPERIAN_SAMPLE],
  ["EQUIFAX_SAMPLE", EQUIFAX_SAMPLE],
  ["UNRECOGNIZED_SAMPLE", UNRECOGNIZED_SAMPLE],
];

for (const [label, text] of fixtures) {
  console.log(`\n=== ${label} ===`);
  console.log("bureau:", detectBureau(text));
  console.log("score:", extractScore(text));
  console.log("accounts:", JSON.stringify(extractAccounts(text), null, 2));
  console.log(
    "collections:",
    JSON.stringify(extractCollections(text), null, 2),
  );
  console.log("inquiries:", JSON.stringify(extractInquiries(text), null, 2));
}
