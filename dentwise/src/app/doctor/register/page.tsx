import Navbar from "@/components/Navbar";
import DoctorRegistrationForm from "@/components/doctor/DoctorRegistrationForm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDoctorProfile } from "@/lib/actions/doctor";

export default async function DoctorRegisterPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/doctor/register");
  }

  const doctorProfile = await getDoctorProfile();
  if (doctorProfile) {
    redirect("/doctor");
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8 pt-24 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Doctor Professional Account</h1>
          <p className="text-muted-foreground">
            Submit your clinic details and documents to activate your professional account.
          </p>
        </header>
        <DoctorRegistrationForm />
      </div>
    </>
  );
}
