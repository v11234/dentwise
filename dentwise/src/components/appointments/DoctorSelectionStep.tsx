"use client";

import { useAvailableDoctors } from "@/hooks/use-doctors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DoctorCardsLoading } from "./DoctorCardsLoading";
import { useTranslations } from "@/components/LocaleProvider";

interface DoctorSelectionStepProps {
  selectedDentistId: string | null;
  onSelectDentist: (dentistId: string) => void;
  onContinue: () => void;
}

function DoctorSelectionStep({
  onContinue,
  onSelectDentist,
  selectedDentistId,
}: DoctorSelectionStepProps) {
  const { t } = useTranslations();
  const { data: dentists = [], isLoading } = useAvailableDoctors();

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t("appointments.doctorSelection.title")}</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("appointments.doctorSelection.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("appointments.doctorSelection.subtitle")}</p>
        </div>
        {!dentists.length && (
          <div className="text-xs text-muted-foreground">
            {t("appointments.doctorSelection.noDoctors")}
          </div>
        )}
      </div>

      {!dentists.length ? (
        <div className="rounded-xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
          {t("appointments.doctorSelection.noDoctorsDetail")}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentists.map((dentist) => (
          <Card
            key={dentist.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDentistId === dentist.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelectDentist(dentist.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Image
                  src={dentist.imageUrl!}
                  alt={dentist.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{dentist.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {dentist.speciality || t("appointments.doctorSelection.specialityFallback")}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">5</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t("appointments.doctorSelection.appointmentCount", {
                        count: dentist.appointmentCount,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="w-4 h-4" />
                <span>{t("appointments.doctorSelection.locationLabel")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneIcon className="w-4 h-4" />
                <span>{dentist.phone}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dentist.bio || t("appointments.doctorSelection.bioFallback")}
              </p>
              <Badge variant="secondary">{t("appointments.doctorSelection.badge")}</Badge>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {selectedDentistId && (
        <div className="flex justify-end">
          <Button onClick={onContinue}>{t("appointments.doctorSelection.continue")}</Button>
        </div>
      )}
    </div>
  );
}
export default DoctorSelectionStep;
