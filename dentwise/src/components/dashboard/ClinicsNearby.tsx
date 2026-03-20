"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPinIcon, NavigationIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAvailableDoctors } from "@/hooks/use-doctors";
import { useTranslations } from "@/components/LocaleProvider";

const ClinicMap = dynamic(() => import("@/components/maps/ClinicMap"), { ssr: false });

type ClinicWithDistance = {
  id: string;
  name: string;
  clinicName?: string | null;
  clinicAddress?: string | null;
  clinicCity?: string | null;
  clinicState?: string | null;
  clinicCountry?: string | null;
  clinicLatitude: number;
  clinicLongitude: number;
  distanceKm?: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(a: [number, number], b: [number, number]) {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export default function ClinicsNearby() {
  const { t } = useTranslations();
  const { data: doctors = [] } = useAvailableDoctors();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t("dashboard.clinics.geolocationUnsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationError(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(t("dashboard.clinics.permissionDenied"));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError(t("dashboard.clinics.positionUnavailable"));
        } else if (error.code === error.TIMEOUT) {
          setLocationError(t("dashboard.clinics.timeout"));
        } else {
          setLocationError(t("dashboard.clinics.enableAccess"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [t]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const clinics = useMemo<ClinicWithDistance[]>(() => {
    const base = doctors
      .filter(
        (doctor) =>
          typeof doctor.clinicLatitude === "number" &&
          typeof doctor.clinicLongitude === "number"
      )
      .map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        clinicName: doctor.clinicName,
        clinicAddress: doctor.clinicAddress,
        clinicCity: doctor.clinicCity,
        clinicState: doctor.clinicState,
        clinicCountry: doctor.clinicCountry,
        clinicLatitude: doctor.clinicLatitude as number,
        clinicLongitude: doctor.clinicLongitude as number,
      }));

    if (!userLocation) return base;

    return base
      .map((clinic) => ({
        ...clinic,
        distanceKm: distanceKm(userLocation, [clinic.clinicLatitude, clinic.clinicLongitude]),
      }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [doctors, userLocation]);

  const nearbyClinics = userLocation
    ? clinics.filter((clinic) => (clinic.distanceKm ?? 0) <= 30)
    : clinics;

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="flex items-center justify-between gap-4 md:flex-row">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-primary" />
            {t("dashboard.clinics.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.clinics.subtitle")}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={requestLocation}>
          <NavigationIcon className="mr-2 h-4 w-4" />
          {t("dashboard.clinics.updateLocation")}
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {locationError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {locationError}
          </div>
        )}

        <ClinicMap clinics={nearbyClinics} userLocation={userLocation} />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {nearbyClinics.length === 0 && (
            <div className="text-sm text-muted-foreground">
              {t("dashboard.clinics.emptyRegistered")}
            </div>
          )}

          {nearbyClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="rounded-xl border border-border/60 bg-card/80 p-4"
            >
              <div className="text-sm font-semibold">
                {clinic.clinicName || clinic.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {[clinic.clinicAddress, clinic.clinicCity, clinic.clinicState, clinic.clinicCountry]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {typeof clinic.distanceKm === "number" && (
                <div className="mt-2 text-xs text-primary">
                  {t("dashboard.clinics.distanceAway", { distance: clinic.distanceKm.toFixed(1) })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
