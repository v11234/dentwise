import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageSquareIcon, CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServerTranslations } from "@/lib/locale";

export default async function MainActions() {
  const { t } = await getServerTranslations();
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* AI Voice Assistant */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image src="/audio.png" alt="Voice AI" width={32} height={32} className="w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t("dashboard.actions.voiceTitle")}</h3>
              <p className="text-muted-foreground">{t("dashboard.actions.voiceSubtitle")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.voiceBullet1")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.voiceBullet2")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.voiceBullet3")}</span>
            </div>
          </div>

          <Link
            href="/voice"
            className={buttonVariants({
              variant: "default",
              className:
                "w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
            })}
          >
            <MessageSquareIcon className="mr-2 h-5 w-5" />
            {t("dashboard.actions.voiceButton")}
          </Link>
        </CardContent>
      </Card>

      {/* Book Appointment */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image src="/calendar.png" alt="Calendar" width={32} height={32} className="w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t("dashboard.actions.bookTitle")}</h3>
              <p className="text-muted-foreground">{t("dashboard.actions.bookSubtitle")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.bookBullet1")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.bookBullet2")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">{t("dashboard.actions.bookBullet3")}</span>
            </div>
          </div>

          <Link href="/appointments">
            <Button
              variant="outline"
              className="w-full mt-6 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold py-3 rounded-xl transition-all duration-300"
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {t("dashboard.actions.bookButton")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
