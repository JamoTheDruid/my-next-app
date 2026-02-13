// app/api/webhooks/angi/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// 1. Define the structure based on the Angi webhook docs
export interface InterviewEntry {
  question: string;
  answer: string;
}
export interface PrimaryPhoneDetails {
  maskedNumber: boolean;
}
export interface AngiWebhookPayload {
  id: string,
  createdAt: Date,
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  primaryPhone: string;
  phoneExt: string;
  secondaryPhone: string;
  secondaryPhoneExt: string;
  email: string;
  srOid: number; // Numeric in JSON
  leadOid: number; // Numeric in JSON
  fee: number; // Numeric in JSON
  taskName: string;
  comments: string;
  matchType: string;
  leadDescription: string;
  spEntityId: number; // Numeric in JSON
  spCompanyName: string;
  contactStatus: string;
  primaryPhoneDetails: PrimaryPhoneDetails; // Nested Object
  crmKey: string;
  leadSource: string;
  trustedFormUrl: string;
  automatedContactCompliant: boolean; // Boolean in JSON
  automatedContactConsentId: string;
  interview: InterviewEntry[]; // The array of Q&A objects
}


export async function POST(req: NextRequest) {
  // 1) Simple auth via x-api-key header
  /*const expectedKey = process.env.ANGI_WEBHOOK_API_KEY; // How do i generate an api key?
  const receivedKey = req.headers.get("x-api-key");

  if (!expectedKey || receivedKey !== expectedKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }*/

  // 2) Parse JSON payload
  let payload: AngiWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // 3) TODO: validate & store
  // Example shape (you'll adjust once you see a real test lead)
  try {
    // Create lead + nested interview rows in one call
    await db.angiLead.create({
      data: {
        name: payload.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        address: payload.address,
        city: payload.city,
        stateProvince: payload.stateProvince,
        postalCode: payload.postalCode,

        primaryPhone: payload.primaryPhone,
        phoneExt: payload.phoneExt ?? null,
        secondaryPhone: payload.secondaryPhone ?? null,
        secondaryPhoneExt: payload.secondaryPhoneExt ?? null,
        primaryMaskedNumber: !!payload.primaryPhoneDetails?.maskedNumber,

        // BigInt fields (Prisma expects BigInt in JS)
        srOid: BigInt(payload.srOid),
        leadOid: BigInt(payload.leadOid),
        spEntityId: BigInt(payload.spEntityId),

        // Decimal field: Prisma accepts string/Decimal for exactness
        fee: payload.fee?.toString() ?? "0.00",

        taskName: payload.taskName,
        comments: payload.comments,
        matchType: payload.matchType,
        leadDescription: payload.leadDescription,
        spCompanyName: payload.spCompanyName,
        contactStatus: payload.contactStatus,
        crmKey: payload.crmKey ?? null,
        leadSource: payload.leadSource,
        trustedFormUrl: payload.trustedFormUrl ?? null,
        automatedContactCompliant: !!payload.automatedContactCompliant,
        automatedContactConsentId: payload.automatedContactConsentId ?? null,

        interview: {
          create: payload.interview.map((q) => ({
                question: q.question,
                answer: q.answer,
              }))
        },
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (err: unknown) {
    // Handle duplicates gracefully (e.g., same leadOid resent)
    // Prisma P2002 = unique constraint violation
    if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2002") {
      return new NextResponse("Already received", { status: 200 });
    }

    console.error("Angi webhook DB error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}