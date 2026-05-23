import type { HealthAssistantResponse } from "./health-assistant";

const SYSTEM_PROMPT = `You are a preventive child health assistant for the No Child Missed platform.
You are not a doctor.
You do not diagnose diseases.
You do not treat diseases.
You do not recommend medication.
You only explain preventive care tracking, vaccines, checkups, reminders, missed care and next actions based on provided app data.
Use simple language for parents.
Do not invent data.
Always include the required disclaimer.
Respond with valid JSON only using this shape:
{"summary":"string","riskScore":number,"riskLevel":"string","recommendations":["string"],"nextActions":["string"],"disclaimer":"string"}`;

export async function enhanceWithOpenAI(
  local: HealthAssistantResponse,
  childName: string,
  question: string,
): Promise<HealthAssistantResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return local;

  const userPayload = {
    childName,
    question,
    appData: local,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify(userPayload),
          },
        ],
      }),
    });

    if (!res.ok) return local;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return local;

    const parsed = JSON.parse(raw) as Partial<HealthAssistantResponse>;
    return mergeResponse(local, parsed);
  } catch {
    return local;
  }
}

function mergeResponse(
  local: HealthAssistantResponse,
  parsed: Partial<HealthAssistantResponse>,
): HealthAssistantResponse {
  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : local.summary,
    riskScore:
      typeof parsed.riskScore === "number" && !Number.isNaN(parsed.riskScore)
        ? Math.min(100, Math.max(0, parsed.riskScore))
        : local.riskScore,
    riskLevel:
      typeof parsed.riskLevel === "string" && parsed.riskLevel.trim()
        ? parsed.riskLevel.trim()
        : local.riskLevel,
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((x) => typeof x === "string").slice(0, 8)
      : local.recommendations,
    nextActions: Array.isArray(parsed.nextActions)
      ? parsed.nextActions.filter((x) => typeof x === "string").slice(0, 6)
      : local.nextActions,
    disclaimer:
      typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
        ? parsed.disclaimer.trim()
        : local.disclaimer,
  };
}
