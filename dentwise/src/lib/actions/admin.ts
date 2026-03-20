"use server";

import { prisma } from "../prisma";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createDateSeries(days: number) {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - (days - 1));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: dateKey(date),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

export async function getAdminAnalytics() {
  const days = 14;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const [
    totalDoctors,
    activeDoctors,
    pendingDoctors,
    suspendedDoctors,
    totalPayments,
    successfulPayments,
    pendingPayments,
    payments,
    appointments,
    totalRevenue,
  ] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { accountStatus: "ACTIVE" } }),
    prisma.doctor.count({ where: { accountStatus: "PENDING_PAYMENT" } }),
    prisma.doctor.count({ where: { accountStatus: "SUSPENDED" } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.count({ where: { status: { in: ["PENDING", "AWAITING_BANK_TRANSFER"] } } }),
    prisma.payment.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, status: true, amount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  const series = createDateSeries(days);
  const appointmentCounts = new Map<string, number>();
  const paymentSuccessCounts = new Map<string, number>();
  const paymentPendingCounts = new Map<string, number>();

  series.forEach((item) => {
    appointmentCounts.set(item.key, 0);
    paymentSuccessCounts.set(item.key, 0);
    paymentPendingCounts.set(item.key, 0);
  });

  appointments.forEach((appointment) => {
    const key = dateKey(appointment.createdAt);
    if (appointmentCounts.has(key)) {
      appointmentCounts.set(key, (appointmentCounts.get(key) || 0) + 1);
    }
  });

  payments.forEach((payment) => {
    const key = dateKey(payment.createdAt);
    if (payment.status === "SUCCESS") {
      paymentSuccessCounts.set(key, (paymentSuccessCounts.get(key) || 0) + 1);
    }
    if (payment.status === "PENDING" || payment.status === "AWAITING_BANK_TRANSFER") {
      paymentPendingCounts.set(key, (paymentPendingCounts.get(key) || 0) + 1);
    }
  });

  const appointmentSeries = series.map((item) => ({
    date: item.label,
    count: appointmentCounts.get(item.key) || 0,
  }));

  const paymentSeries = series.map((item) => ({
    date: item.label,
    success: paymentSuccessCounts.get(item.key) || 0,
    pending: paymentPendingCounts.get(item.key) || 0,
  }));

  return {
    doctorStats: {
      total: totalDoctors,
      active: activeDoctors,
      pending: pendingDoctors,
      suspended: suspendedDoctors,
    },
    paymentStats: {
      total: totalPayments,
      success: successfulPayments,
      pending: pendingPayments,
      revenue: totalRevenue._sum.amount || 0,
    },
    appointmentSeries,
    paymentSeries,
  };
}
