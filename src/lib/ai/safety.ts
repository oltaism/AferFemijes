export const MEDICAL_SAFETY_RESPONSE =
  "I can only help with preventive care tracking such as vaccines, checkups, reminders and next actions. Please consult a healthcare professional for medical concerns.";

export const AI_DISCLAIMER =
  "This system provides informational guidance only and does not replace professional medical advice.";

const BLOCKED_PATTERNS: RegExp[] = [
  /\b(diagnos|diagnoz|sëmundje|semundje|disease|illness|sick with)\b/i,
  /\b(simptom|symptom|temperatur|fever|dhimbj|pain|vomit|tus|kollë|cough)\b/i,
  /\b(ilaç|medikament|medicine|medication|antibiotik|antibiot|antibiotic|dozë|doze|dose|dosage)\b/i,
  /\b(trajtim|treatment|therapy|terapi|prescription|recetë|recete)\b/i,
  /\b(infeksion|infection|virus|bakter|bacterial)\b/i,
  /\b(emergjenc|emergency|urgjenc|911|112|ambulanc)\b/i,
  /\b(lab\b|laborator|blood test|analiz|rezultat laboratori)\b/i,
  /\b(painkiller|ibuprofen|paracetamol|acetaminophen|antipyretic)\b/i,
  /\b(a ka|a duhet antibiot|a eshte|a është i sëmur|confirm infection)\b/i,
  /\b(si ta trajtoj|how to treat|what medicine|çfarë ilaçi|cfare ilaci)\b/i,
];

export function normalizeQueryText(question: string | null | undefined): string {
  if (question == null || typeof question !== "string") return "";
  return question.trim().toLowerCase();
}

export function isBlockedMedicalQuery(
  question: string | null | undefined,
): boolean {
  const text = normalizeQueryText(question);
  if (!text) return false;
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}
