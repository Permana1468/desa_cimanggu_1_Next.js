import { NextResponse } from "next/server";
import { getChatContacts } from "@/actions/chat";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contacts = await getChatContacts();
    return NextResponse.json({ contacts });
  } catch (err) {
    return NextResponse.json({ contacts: [] });
  }
}
