"use server";

import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { syncUser } from "./users";

async function getDbUserOrThrow() {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in.");

  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existingUser) return existingUser;

  const synced = await syncUser();
  if (!synced) throw new Error("Unable to load user profile.");

  return synced;
}

export async function getDoctorProfile() {
  const dbUser = await getDbUserOrThrow();

  return await prisma.doctor.findFirst({
    where: { userId: dbUser.id },
    include: {
      documents: true,
    },
  });
}

type DoctorAppointmentWithRelations = {
  user: { firstName?: string | null; lastName?: string | null; email: string };
  date: Date;
  id: string;
  time: string;
  reason?: string | null;
  status: string;
};

function transformDoctorAppointment(appointment: DoctorAppointmentWithRelations) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    date: appointment.date.toISOString().split("T")[0],
    time: appointment.time,
  };
}

export async function getDoctorAppointments() {
  const doctor = await getDoctorProfile();
  if (!doctor) return [];

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return appointments.map(transformDoctorAppointment);
}

export async function updateDoctorAppointmentStatus(input: {
  id: string;
  status: AppointmentStatus;
}) {
  const doctor = await getDoctorProfile();
  if (!doctor) throw new Error("Doctor profile not found.");

  const appointment = await prisma.appointment.findUnique({ where: { id: input.id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    throw new Error("You are not authorized to update this appointment.");
  }

  if (!["ACCEPTED", "REJECTED"].includes(input.status)) {
    throw new Error("Only ACCEPTED or REJECTED statuses are allowed.");
  }

  return await prisma.appointment.update({
    where: { id: input.id },
    data: { status: input.status },
  });
}
