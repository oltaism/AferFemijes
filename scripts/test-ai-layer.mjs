/**
 * Quick smoke test for preventive AI safety patterns (no OpenAI).
 * Run: node scripts/test-ai-layer.mjs
 */

const blocked = [
  "Çfarë ilaçi t'i jap?",
  "A ka infeksion?",
  "A duhet antibiotik?",
  "Çfarë doze?",
  "Si ta trajtoj temperaturën?",
];
const allowed = [
  "Cila vaksinë është e radhës?",
  "Pse është rreziku mesatar?",
  "Çka duhet të bëj këtë javë?",
  "A kemi kontrolle të humbura?",
  "Përmblidh historikun e fëmijës.",
];

const patterns = [
  /\b(ilaç|medikament|medicine|medication|antibiotik|antibiot|antibiotic|dozë|doze|dose|dosage)\b/i,
  /\b(infeksion|infection)\b/i,
  /\b(si ta trajtoj|how to treat|what medicine|çfarë ilaçi|cfare ilaci)\b/i,
  /\b(simptom|symptom|temperatur|fever)\b/i,
  /\b(a duhet antibiot|a ka infeksion)\b/i,
];

function isBlocked(q) {
  const text = (q ?? "").trim().toLowerCase();
  return patterns.some((p) => p.test(text));
}

let fail = 0;
for (const q of blocked) {
  if (!isBlocked(q)) {
    console.error("FAIL should block:", q);
    fail++;
  }
}
for (const q of allowed) {
  if (isBlocked(q)) {
    console.error("FAIL should allow:", q);
    fail++;
  }
}
console.log(fail === 0 ? "Pattern smoke test OK" : `Pattern smoke test FAILED (${fail})`);
process.exit(fail === 0 ? 0 : 1);
