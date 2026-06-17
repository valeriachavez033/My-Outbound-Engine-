import { NextResponse } from "next/server";
import { db, settings } from "@/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const rows = await db.select().from(settings).limit(1);
    const row = rows[0] ?? null;

    if (!row) {
      return NextResponse.json({ settings: null });
    }

    // Never return the raw API keys to the client — mask them
    return NextResponse.json({
      settings: {
        ...row,
        instantlyApiKey: row.instantlyApiKey ? "sk-***" : null,
        anthropicApiKey: row.anthropicApiKey ? "sk-***" : null,
        slackWebhookUrl: row.slackWebhookUrl ? "https://***" : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();

    const existing = await db.select().from(settings).limit(1);

    const payload = {
      sendingDomain: body.sendingDomain ?? null,
      spendCapWeeklyUsd: body.spendCapWeeklyUsd
        ? parseFloat(body.spendCapWeeklyUsd)
        : 500,
      updatedAt: new Date(),
      // Only update keys if a new non-masked value was sent
      ...(body.instantlyApiKey && !body.instantlyApiKey.includes("***")
        ? { instantlyApiKey: body.instantlyApiKey }
        : {}),
      ...(body.anthropicApiKey && !body.anthropicApiKey.includes("***")
        ? { anthropicApiKey: body.anthropicApiKey }
        : {}),
      ...(body.slackWebhookUrl && !body.slackWebhookUrl.includes("***")
        ? { slackWebhookUrl: body.slackWebhookUrl }
        : {}),
    };

    if (existing.length === 0) {
      await db.insert(settings).values(payload);
    } else {
      await db.update(settings).set(payload);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
