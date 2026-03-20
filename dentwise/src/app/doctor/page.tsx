import Navbar from "@/components/Navbar";
import DoctorDashboardClient from "@/components/doctor/DoctorDashboardClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DoctorDashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/doctor");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <DoctorDashboardClient />
      </div>
    </div>
  );
}
