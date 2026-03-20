"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DoctorPaymentPanel from "./DoctorPaymentPanel";

const DOCTOR_FEE = Number(process.env.NEXT_PUBLIC_DOCTOR_PRO_FEE || "50000");

export default function DoctorRegistrationForm() {
  const { user } = useUser();
  const [step, setStep] = useState<"form" | "payment">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicLatitude, setClinicLatitude] = useState("");
  const [clinicLongitude, setClinicLongitude] = useState("");
  const [gender, setGender] = useState("MALE");

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClinicLatitude(position.coords.latitude.toFixed(6));
        setClinicLongitude(position.coords.longitude.toFixed(6));
        toast.success("Clinic coordinates captured.");
      },
      () => {
        toast.error("Unable to access location. Please enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("clinicLatitude", clinicLatitude);
      formData.set("clinicLongitude", clinicLongitude);

      const response = await fetch("/api/doctors/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to register doctor profile");
      }

      toast.success(data.message || "Doctor profile created.");
      setStep("payment");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "payment") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-2xl font-semibold">Activate your professional account</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Complete the professional account fee to unlock your doctor dashboard.
          </p>
        </div>
        <DoctorPaymentPanel fee={DOCTOR_FEE} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
            Doctor registration
          </Badge>
          <span className="text-sm text-muted-foreground">
            All fields marked with * are required.
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Provide your clinic location and upload required documents to verify your professional
          account.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Doctor Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name *</Label>
            <Input id="name" name="name" placeholder="Dr. Jane Smith" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="speciality">Speciality *</Label>
            <Input id="speciality" name="speciality" placeholder="General Dentistry" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.emailAddresses?.[0]?.emailAddress || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" name="phone" placeholder="(555) 123-4567" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <input type="hidden" name="gender" value={gender} />
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile image *</Label>
            <Input id="profileImage" name="profileImage" type="file" accept="image/*" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" name="bio" placeholder="A brief professional summary" rows={3} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Clinic Location</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic name *</Label>
            <Input id="clinicName" name="clinicName" placeholder="Smile Care Clinic" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">Clinic phone</Label>
            <Input id="clinicPhone" name="clinicPhone" placeholder="(555) 987-6543" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="clinicAddress">Clinic address *</Label>
            <Input id="clinicAddress" name="clinicAddress" placeholder="123 Dental Ave" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicCity">City *</Label>
            <Input id="clinicCity" name="clinicCity" placeholder="City" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicState">State / Region</Label>
            <Input id="clinicState" name="clinicState" placeholder="State" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicPostalCode">Postal code</Label>
            <Input id="clinicPostalCode" name="clinicPostalCode" placeholder="ZIP / Postal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicCountry">Country *</Label>
            <Input id="clinicCountry" name="clinicCountry" placeholder="Country" required />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="clinicLatitude">Latitude</Label>
            <Input
              id="clinicLatitude"
              name="clinicLatitude"
              placeholder="e.g. 37.773972"
              value={clinicLatitude}
              onChange={(event) => setClinicLatitude(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicLongitude">Longitude</Label>
            <Input
              id="clinicLongitude"
              name="clinicLongitude"
              placeholder="e.g. -122.431297"
              value={clinicLongitude}
              onChange={(event) => setClinicLongitude(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full" onClick={handleUseLocation}>
              Use my location
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Licenses & Identifiers</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Medical/Dental license number *</Label>
            <Input id="licenseNumber" name="licenseNumber" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseState">License issuing state *</Label>
            <Input id="licenseState" name="licenseState" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseExpiry">License expiry date</Label>
            <Input id="licenseExpiry" name="licenseExpiry" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="npiNumber">NPI number (if applicable)</Label>
            <Input id="npiNumber" name="npiNumber" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deaNumber">DEA number (if prescribing)</Label>
            <Input id="deaNumber" name="deaNumber" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Clinic Operation License</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clinicLicenseNumber">Clinic license number *</Label>
            <Input id="clinicLicenseNumber" name="clinicLicenseNumber" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicLicenseState">Clinic license state *</Label>
            <Input id="clinicLicenseState" name="clinicLicenseState" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicLicenseExpiry">Clinic license expiry date</Label>
            <Input id="clinicLicenseExpiry" name="clinicLicenseExpiry" type="date" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Required Documents</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="medicalLicense">Medical/Dental license (PDF or image) *</Label>
            <Input id="medicalLicense" name="medicalLicense" type="file" accept="image/*,application/pdf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicLicense">Clinic operation license (PDF or image) *</Label>
            <Input id="clinicLicense" name="clinicLicense" type="file" accept="image/*,application/pdf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="governmentId">Government ID (PDF or image) *</Label>
            <Input id="governmentId" name="governmentId" type="file" accept="image/*,application/pdf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="malpracticeInsurance">Malpractice insurance (optional)</Label>
            <Input id="malpracticeInsurance" name="malpracticeInsurance" type="file" accept="image/*,application/pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="degreeCertificate">Degree certificate (optional)</Label>
            <Input id="degreeCertificate" name="degreeCertificate" type="file" accept="image/*,application/pdf" />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit and Continue"}
        </Button>
      </div>
    </form>
  );
}
