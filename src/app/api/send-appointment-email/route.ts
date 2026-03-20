import { NextResponse } from "next/server";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import resend from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
    } = body;

    // validate required fields
    if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const fromEmail = process.env.EMAIL_FROM;

    if (!process.env.RESEND_API_KEY || !fromEmail) {
      console.error("Email configuration error:", {
        hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
        hasEmailFrom: Boolean(fromEmail),
      });

      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: "Appointment Confirmation - DentWise",
      react: AppointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType: appointmentType || "Dental consultation",
        duration: duration || "Not specified",
        price: price || "To be confirmed",
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", emailId: data?.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
