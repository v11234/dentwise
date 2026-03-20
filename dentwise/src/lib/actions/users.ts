"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`syncUser timeout after ${ms}ms`)), ms);
    }),
  ]);
}

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const runSync = async () => {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
      });
      if (existingUser) return existingUser;

      return await prisma.user.create({
        data: {
          clerkId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          phone: user.phoneNumbers[0]?.phoneNumber,
        },
      });
    };

    const timeoutMs = process.env.NODE_ENV === "development" ? 3000 : 8000;
    return await withTimeout(runSync(), timeoutMs);
  } catch (error) {
    const err = error as { message?: string; code?: string };
    console.warn("[syncUser] DB unavailable", {
      message: err?.message ?? "Unknown error",
      code: err?.code,
    });
    return null;
    }
}
