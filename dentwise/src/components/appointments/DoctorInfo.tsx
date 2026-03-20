"use client";

import { useAvailableDoctors } from "@/hooks/use-doctors";
import Image from "next/image";
import { useTranslations } from "@/components/LocaleProvider";

function DoctorInfo({ doctorId }: { doctorId: string }) {
  const { t } = useTranslations();
  const { data: doctors = [] } = useAvailableDoctors();
  const doctor = doctors.find((d) => d.id === doctorId);

  if (!doctor) return null;

  const clinicLocation =
    typeof doctor.clinicLatitude === "number" && typeof doctor.clinicLongitude === "number"
      ? `${doctor.clinicLatitude.toFixed(6)}, ${doctor.clinicLongitude.toFixed(6)}`
      : t("appointments.doctorInfo.locationUnavailable");

  return (
    <div className="rounded-xl border border-border p-4 bg-card">
      <div className="flex items-start gap-4">
        <Image
          src={doctor.imageUrl || "/default-avatar.png"}
          alt={doctor.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <span className="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary">
              {doctor.speciality || t("appointments.doctorInfo.specialityFallback")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {doctor.clinicName || t("appointments.doctorInfo.clinicFallback")}
            {doctor.clinicCity ? ` • ${doctor.clinicCity}` : ""}
          </p>
          {doctor.clinicAddress && <p className="text-xs text-muted-foreground">{doctor.clinicAddress}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            📍 {t("appointments.doctorInfo.mapLocation", { location: clinicLocation })}
          </p>
          <p className="text-xs text-muted-foreground">📞 {doctor.phone || t("appointments.doctorInfo.noPhone")}</p>
        </div>
      </div>
    </div>
  );
}

export default DoctorInfo;

