"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { syncUser } from "./users";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import { AppointmentStatus } from "@prisma/client";

type AppointmentWithRelations = {
  id: string;
  user: { firstName?: string | null; lastName?: string | null; email: string };
  doctor: { name: string; email: string; imageUrl?: string | null };
  date: Date;
  time: string;
  status: string;
  reason?: string | null;
};

function transformAppointment(appointment: AppointmentWithRelations) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorEmail: appointment.doctor.email,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

async function getDbUserOrThrow() {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be authenticated");

  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existingUser) return existingUser;

  const synced = await syncUser();
  if (!synced) throw new Error("User not found. Please ensure your account is properly set up.");

  return synced;
}

export async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, email: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.log("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getUserAppointments() {
  try {
    const user = await getDbUserOrThrow();

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, email: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

export async function getUserAppointmentStats() {
  try {
    const user = await getDbUserOrThrow();

    // these calls will run in parallel, instead of waiting each other
    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: { userId: user.id },
      }),
      prisma.appointment.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["PENDING", "ACCEPTED", "COMPLETED"], // block pending + accepted + completed slots
        },
      },
      select: { time: true },
    });

    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return []; // return empty array if there's an error
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  paidAmountCFA?: number;
}

function getUsdFromReason(reason: string | undefined) {
  if (!reason) return 0;
  const appointment = APPOINTMENT_TYPES.find((item) => item.name === reason);
  if (!appointment) return 0;
  const match = appointment.price.match(/\$([\d.]+)/);
  if (!match) return 0;
  return Number(match[1]);
}

function getPriceCFAFromUsd(usd: number) {
  const usdToCFA = Number(process.env.FCFA_EXCHANGE_RATE || "600");
  return Math.round(usd * usdToCFA);
}

export async function bookAppointment(input: BookAppointmentInput) {
  try {
    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    if (!input.paidAmountCFA || input.paidAmountCFA <= 0) {
      throw new Error("Payment is required before confirming the appointment.");
    }

    const appointmentTypePriceUsd = getUsdFromReason(input.reason);
    const requiredCFA = appointmentTypePriceUsd > 0 ? getPriceCFAFromUsd(appointmentTypePriceUsd) : 20;

    if (input.paidAmountCFA < requiredCFA) {
      throw new Error(
        `Please pay the full appointment fee before booking. Required: ${requiredCFA} FCFA.`
      );
    }

    const user = await getDbUserOrThrow();

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: new Date(input.date),
        time: input.time,
        reason: input.reason || "General consultation",
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, email: true, imageUrl: true } },
      },
    });

    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

export async function updateAppointmentStatus(input: { id: string; status: AppointmentStatus }) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    return appointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
}
