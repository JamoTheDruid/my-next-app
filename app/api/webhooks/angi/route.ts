// app/api/webhooks/angi/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1) Simple auth via x-api-key header
  const expectedKey = process.env.ANGI_WEBHOOK_API_KEY;
  const receivedKey = req.headers.get("x-api-key");

  if (!expectedKey || receivedKey !== expectedKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2) Parse JSON payload
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // 3) TODO: validate & store
  // Example shape (you'll adjust once you see a real test lead)
  // const lead = {
  //   externalId: payload.lead_id,
  //   name: payload.customer_name,
  //   phone: payload.phone,
  //   email: payload.email,
  //   address: payload.address,
  //   requestedService: payload.service_type,
  //   raw: payload,
  // };

  // await db.lead.create({ data: lead });

  // 4) Return quickly so Angi sees success
  return new NextResponse("OK", { status: 200 });
}
