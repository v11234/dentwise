"use client";

import { APPOINTMENT_TYPES } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DoctorInfo from "./DoctorInfo";
import { useTranslations } from "@/components/LocaleProvider";
import { LOCALE_TAGS } from "@/lib/i18n";

function formatCfaFromPrice(usdString: string | undefined) {
  if (!usdString) return "20";
  const match = usdString.match(/\$([\d.]+)/);
  if (!match) return "20";
  const usdValue = Number(match[1]);
  const cfa = Math.round(usdValue * 600);
  return cfa.toLocaleString();
}

interface BookingConfirmationStepProps {
  selectedDentistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  isBooking: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onModify: () => void;
}

function BookingConfirmationStep({
  selectedDentistId,
  selectedDate,
  selectedTime,
  selectedType,
  isBooking,
  onBack,
  onConfirm,
  onModify,
}: BookingConfirmationStepProps) {
  const { t, locale } = useTranslations();
  const localeTag = LOCALE_TAGS[locale];
  const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>
        <h2 className="text-2xl font-semibold">{t("appointments.confirmation.title")}</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("appointments.confirmation.summary")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* doctor info */}
          <DoctorInfo doctorId={selectedDentistId} />

          {/* appointment details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.appointmentType")}</p>
              <p className="font-medium">{appointmentType?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.duration")}</p>
              <p className="font-medium">{appointmentType?.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.date")}</p>
              <p className="font-medium">
                {new Date(selectedDate).toLocaleDateString(localeTag, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.time")}</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.location")}</p>
              <p className="font-medium">{t("appointments.confirmation.locationDetail")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("appointments.confirmation.cost")}</p>
              <p className="font-medium text-primary">
                {appointmentType?.price} (~{formatCfaFromPrice(appointmentType?.price)} FCFA)
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {t("appointments.confirmation.payNote")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* action buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onModify}>
          {t("appointments.confirmation.modify")}
        </Button>
        <Button onClick={onConfirm} className="bg-primary" disabled={isBooking}>
          {isBooking ? t("appointments.confirmation.processing") : t("appointments.confirmation.pay")}
        </Button>
      </div>
    </div>
  );
}

export default BookingConfirmationStep;
