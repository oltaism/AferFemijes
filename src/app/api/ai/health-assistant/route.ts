import { NextResponse } from "next/server";
import { findChild } from "@/lib/mock-data";
import {
  buildBlockedResponse,
  buildHealthAssistantFromQuestion,
} from "@/lib/ai/health-assistant";
import { enhanceWithOpenAI } from "@/lib/ai/openai-enhance";
import { isBlockedMedicalQuery } from "@/lib/ai/safety";

export const runtime = "nodejs";

type RequestBody = {
  childId?: string;
  question?: string;
};

export async function POST(request: Request) {
  try {
    let body: RequestBody = {};
    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const childId =
      typeof body.childId === "string" ? body.childId.trim() : "";
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!childId) {
      return NextResponse.json(
        { error: "childId is required." },
        { status: 400 },
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "question is required." },
        { status: 400 },
      );
    }

    if (isBlockedMedicalQuery(question)) {
      return NextResponse.json(buildBlockedResponse());
    }

    const child = findChild(childId);
    let response = buildHealthAssistantFromQuestion(child, question);

    if (child) {
      response = await enhanceWithOpenAI(
        response,
        child.fullName,
        question,
      );
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        summary:
          "Ndodhi një gabim i përkohshëm. Ju lutemi provoni përsëri ose shikoni panelin e fëmijës.",
        riskScore: 0,
        riskLevel: "low",
        recommendations: [],
        nextActions: ["Rifreskoni faqen dhe provoni përsëri."],
        disclaimer:
          "This system provides informational guidance only and does not replace professional medical advice.",
      },
      { status: 200 },
    );
  }
}
