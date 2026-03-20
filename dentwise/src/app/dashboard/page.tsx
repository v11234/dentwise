import ActivityOverview from "@/components/dashboard/ActivityOverview";
import ClinicsNearby from "@/components/dashboard/ClinicsNearby";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
        <div className="mt-10">
          <ClinicsNearby />
        </div>
      </div>
    </>
  );
}
export default DashboardPage;
