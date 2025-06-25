import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import connect from "@/utils/mongoose";
import PasswordReset from "@/models/PasswordReset";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { renderLocalizedEmailTemplate } from "@/utils/templates/renderEmailTemplates";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json().catch(() => ({}));
  const email = body.email || session?.user?.email;
  const lang = body.lang || 'en';

  if (!email) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    await connect();
  } catch (err) {
    console.error("DB connection failed:", err);
    return NextResponse.json(
      { success: false, error: "DB connection failed" },
      { status: 500 }
    );
  }

  await PasswordReset.deleteMany({ email });
  const token = randomBytes(32).toString("hex");
  await PasswordReset.create({
    email,
    token,
  });

  const resend = new Resend(process.env.RESEND_API_KEY || "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    const { html, subject } = await renderLocalizedEmailTemplate(
      "passwordreset-email",
      lang,
      {
        appUrl,
        token,
        lang,
        year: new Date().getFullYear(),
      }
    );

    try {
      await resend.emails.send({
        from: "PAiMO <hello@paimo.io>",
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error("Failed to send reset email", e);
      return NextResponse.json(
        { success: false, message: "Email send failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
