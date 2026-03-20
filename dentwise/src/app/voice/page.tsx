import Navbar from "@/components/Navbar";
import FeatureCards from "@/components/voice/FeatureCards";
import ProPlanRequired from "@/components/voice/ProPlanRequired";
import VapiWidget from "@/components/voice/VapiWidget";
import WelcomeSection from "@/components/voice/WelcomeSection";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"


async function VoicePage() {
// const {has}=await auth();
// const hasProplan=has({plan:"ai_basic"})||has({plan:"ai_pro"});
// if(!hasProplan)return <ProPlanRequired/>;

const { userId, has } = await auth();

  if (!userId) return <ProPlanRequired />;

  // ✅ Check CamPay payment
  const payment = await prisma.payment.findFirst({
    where: { userId, status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
  });

  const hasCamPay = !!payment;

  // ✅ Check Clerk billing
  const hasClerkPlan =
    has({ plan: "ai_basic" }) || has({ plan: "ai_pro" });

  // ✅ Allow if ANY payment is valid
  if (!hasCamPay && !hasClerkPlan) {
    return <ProPlanRequired />;
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <WelcomeSection />
        <FeatureCards />
        <div className="mt-8">
          <VapiWidget />
        </div>
      </div>
    </div>
  );
}

export default VoicePage
