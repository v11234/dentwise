import { MicIcon } from "lucide-react";
import { getServerTranslations } from "@/lib/locale";

async function WelcomeSection() {
  const { t } = await getServerTranslations();
  return (
    <div className="z-10 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 md:p-8 border border-primary/20 mb-8 md:mb-12 overflow-hidden gap-6">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary">{t("voice.readyBadge")}</span>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("voice.welcomeTitle")}</h1>
          <p className="text-muted-foreground">
            {t("voice.welcomeSubtitle")}
          </p>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
          <MicIcon className="w-16 h-16 text-primary" />
        </div>
      </div>
    </div>
  );
}
export default WelcomeSection;
