import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/actions/users";

export const runtime = "nodejs";

const doctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  speciality: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE"]),
  bio: z.string().optional(),
  clinicName: z.string().min(2),
  clinicPhone: z.string().optional(),
  clinicAddress: z.string().min(4),
  clinicCity: z.string().min(2),
  clinicState: z.string().min(2).optional(),
  clinicPostalCode: z.string().min(2).optional(),
  clinicCountry: z.string().min(2),
  clinicLatitude: z.number().optional(),
  clinicLongitude: z.number().optional(),
  clinicLicenseNumber: z.string().min(3),
  clinicLicenseState: z.string().min(2),
  clinicLicenseExpiry: z.date().optional(),
  licenseNumber: z.string().min(3),
  licenseState: z.string().min(2),
  licenseExpiry: z.date().optional(),
  npiNumber: z.string().min(5).optional(),
  deaNumber: z.string().min(3).optional(),
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalDate(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getOptionalNumber(value: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

async function saveUpload(file: File, uploadId: string, prefix: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(file.name) || ".bin";
  const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, "");
  const filename = `${safePrefix}-${Date.now()}-${randomUUID()}${ext}`;
  const relativePath = path.posix.join("uploads", "doctors", uploadId, filename);
  const targetPath = path.join(process.cwd(), "public", relativePath);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer);

  return `/${relativePath}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const parsed = doctorSchema.safeParse({
      name: getString(formData, "name"),
      email: getString(formData, "email"),
      phone: getString(formData, "phone"),
      speciality: getString(formData, "speciality"),
      gender: getString(formData, "gender"),
      bio: getString(formData, "bio") || undefined,
      clinicName: getString(formData, "clinicName"),
      clinicPhone: getString(formData, "clinicPhone") || undefined,
      clinicAddress: getString(formData, "clinicAddress"),
      clinicCity: getString(formData, "clinicCity"),
      clinicState: getString(formData, "clinicState") || undefined,
      clinicPostalCode: getString(formData, "clinicPostalCode") || undefined,
      clinicCountry: getString(formData, "clinicCountry"),
      clinicLatitude: getOptionalNumber(getString(formData, "clinicLatitude")),
      clinicLongitude: getOptionalNumber(getString(formData, "clinicLongitude")),
      clinicLicenseNumber: getString(formData, "clinicLicenseNumber"),
      clinicLicenseState: getString(formData, "clinicLicenseState"),
      clinicLicenseExpiry: getOptionalDate(getString(formData, "clinicLicenseExpiry")),
      licenseNumber: getString(formData, "licenseNumber"),
      licenseState: getString(formData, "licenseState"),
      licenseExpiry: getOptionalDate(getString(formData, "licenseExpiry")),
      npiNumber: getString(formData, "npiNumber") || undefined,
      deaNumber: getString(formData, "deaNumber") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid doctor registration data" }, { status: 400 });
    }

    const profileImage = formData.get("profileImage");
    const medicalLicense = formData.get("medicalLicense");
    const clinicLicense = formData.get("clinicLicense");
    const governmentId = formData.get("governmentId");

    if (!isFile(profileImage) || profileImage.size === 0) {
      return NextResponse.json({ error: "Profile image is required" }, { status: 400 });
    }
    if (!isFile(medicalLicense) || medicalLicense.size === 0) {
      return NextResponse.json({ error: "Medical/Dental license document is required" }, { status: 400 });
    }
    if (!isFile(clinicLicense) || clinicLicense.size === 0) {
      return NextResponse.json({ error: "Clinic operation license is required" }, { status: 400 });
    }
    if (!isFile(governmentId) || governmentId.size === 0) {
      return NextResponse.json({ error: "Government ID is required" }, { status: 400 });
    }

    const dbUser = (await prisma.user.findUnique({ where: { clerkId: userId } })) || (await syncUser());
    if (!dbUser) {
      return NextResponse.json({ error: "Unable to load user profile" }, { status: 500 });
    }

    const existingDoctor = await prisma.doctor.findFirst({ where: { userId: dbUser.id } });
    if (existingDoctor) {
      return NextResponse.json({ error: "Doctor profile already exists" }, { status: 409 });
    }

    const uploadId = randomUUID();
    const profileImageUrl = await saveUpload(profileImage, uploadId, "profile-image");

    const documents: Array<{ type: string; url: string }> = [];
    documents.push({
      type: "medical_license",
      url: await saveUpload(medicalLicense, uploadId, "medical-license"),
    });
    documents.push({
      type: "clinic_license",
      url: await saveUpload(clinicLicense, uploadId, "clinic-license"),
    });
    documents.push({
      type: "government_id",
      url: await saveUpload(governmentId, uploadId, "government-id"),
    });

    const malpracticeInsurance = formData.get("malpracticeInsurance");
    if (isFile(malpracticeInsurance) && malpracticeInsurance.size > 0) {
      documents.push({
        type: "malpractice_insurance",
        url: await saveUpload(malpracticeInsurance, uploadId, "malpractice-insurance"),
      });
    }

    const degreeCertificate = formData.get("degreeCertificate");
    if (isFile(degreeCertificate) && degreeCertificate.size > 0) {
      documents.push({
        type: "degree_certificate",
        url: await saveUpload(degreeCertificate, uploadId, "degree-certificate"),
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId: dbUser.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        speciality: parsed.data.speciality,
        gender: parsed.data.gender,
        bio: parsed.data.bio,
        imageUrl: profileImageUrl,
        clinicName: parsed.data.clinicName,
        clinicPhone: parsed.data.clinicPhone,
        clinicAddress: parsed.data.clinicAddress,
        clinicCity: parsed.data.clinicCity,
        clinicState: parsed.data.clinicState,
        clinicPostalCode: parsed.data.clinicPostalCode,
        clinicCountry: parsed.data.clinicCountry,
        clinicLatitude: parsed.data.clinicLatitude,
        clinicLongitude: parsed.data.clinicLongitude,
        clinicLicenseNumber: parsed.data.clinicLicenseNumber,
        clinicLicenseState: parsed.data.clinicLicenseState,
        clinicLicenseExpiry: parsed.data.clinicLicenseExpiry,
        licenseNumber: parsed.data.licenseNumber,
        licenseState: parsed.data.licenseState,
        licenseExpiry: parsed.data.licenseExpiry,
        npiNumber: parsed.data.npiNumber,
        deaNumber: parsed.data.deaNumber,
        accountStatus: "PENDING_PAYMENT",
        isActive: false,
        documents: {
          create: documents,
        },
      },
    });

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...(clerkUser.publicMetadata || {}),
        role: "doctor",
        doctorId: doctor.id,
      },
    });

    return NextResponse.json({
      message: "Doctor profile created. Complete payment to activate your professional account.",
      doctorId: doctor.id,
    });
  } catch (error) {
    console.error("[doctor/register] failed", error);
    return NextResponse.json({ error: "Failed to register doctor" }, { status: 500 });
  }
}
