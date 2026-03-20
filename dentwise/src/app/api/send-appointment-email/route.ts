import { render } from "@react-email/render";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import DoctorAppointmentNotificationEmail from "@/components/emails/DoctorAppointmentNotificationEmail";
import { sendEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      patientName,
      doctorEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
      userEmail: requestUserEmail,
    } = body;

    const { userId } = await auth();
    const safeRequestUserEmail =
      typeof requestUserEmail === "string" ? requestUserEmail.trim() : "";
    let resolvedUserEmail = safeRequestUserEmail;

    // Only fall back to Clerk if the request didn't provide a usable email.
    if (!resolvedUserEmail && userId) {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      resolvedUserEmail = primaryEmail || clerkUser.emailAddresses[0]?.emailAddress || safeRequestUserEmail;
    }

    // validate required fields
    if (!resolvedUserEmail || !doctorEmail || !doctorName || !appointmentDate || !appointmentTime) {
      console.error("[send-appointment-email] missing required fields", {
        resolvedUserEmail,
        doctorEmail,
        doctorName,
        appointmentDate,
        appointmentTime,
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fromEmail = process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`;
    console.log("[send-appointment-email] input", { resolvedUserEmail, doctorEmail, patientName, doctorName, appointmentType });
    if (!fromEmail) {
      return NextResponse.json(
        { error: "Email service is not configured (missing EMAIL_USER/EMAIL_FROM)" },
        { status: 500 }
      );
    }

    const userHtml = await render(
      AppointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
      })
    );

    const doctorHtml = await render(
      DoctorAppointmentNotificationEmail({
        doctorName,
        patientName: patientName || "Patient",
        patientEmail: resolvedUserEmail,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
      })
    );

    const results = {
      userEmailSent: false,
      doctorEmailSent: false,
      userError: null as string | null,
      doctorError: null as string | null,
    };

    try {
      console.log("[send-appointment-email] sending patient email", { resolvedUserEmail });
      await sendEmail({
        from: fromEmail,
        to: resolvedUserEmail,
        subject: "Appointment Request Received - DentWise",
        html: userHtml,
        text: `Your appointment request for ${appointmentType} on ${appointmentDate} at ${appointmentTime} is received.`,
      });
      results.userEmailSent = true;
    } catch (userErr) {
      console.error("Failed to send appointment email to patient", { resolvedUserEmail, error: userErr });
      results.userError = (userErr as Error).message;
    }

    try {
      console.log("[send-appointment-email] sending doctor email", { doctorEmail });
      await sendEmail({
        from: fromEmail,
        to: doctorEmail,
        subject: "New Appointment Request - DentWise",
        html: doctorHtml,
        text: `New appointment request from ${patientName || "Patient"} for ${appointmentType} on ${appointmentDate} at ${appointmentTime}.`,
      });
      results.doctorEmailSent = true;
    } catch (doctorErr) {
      console.error("Failed to send appointment email to doctor", { doctorEmail, error: doctorErr });
      results.doctorError = (doctorErr as Error).message;
    }

    return NextResponse.json({
      message: "Appointment email result",
      ...results,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
