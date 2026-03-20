"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, type MapContainerProps } from "react-leaflet";

type ClinicLocation = {
  id: string;
  name: string;
  clinicName?: string | null;
  clinicAddress?: string | null;
  clinicCity?: string | null;
  clinicState?: string | null;
  clinicCountry?: string | null;
  clinicLatitude: number;
  clinicLongitude: number;
};

type Props = {
  clinics: ClinicLocation[];
  userLocation?: [number, number] | null;
};

export default function ClinicMap({ clinics, userLocation }: Props) {
  const fallbackCenter: [number, number] = [37.773972, -122.431297];
  const bounds = clinics.length > 0 ? clinics.map((clinic) => [clinic.clinicLatitude, clinic.clinicLongitude] as [number, number]) : [fallbackCenter];
  if (userLocation) bounds.push(userLocation);

  const mapProps: MapContainerProps = {
    bounds,
  };

  return (
    <MapContainer {...mapProps} className="h-80 w-full rounded-2xl border">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <CircleMarker center={userLocation} pathOptions={{ color: "#2563eb" }}>
          <Popup>Your location</Popup>
        </CircleMarker>
      )}

      {clinics.map((clinic) => (
        <CircleMarker
          key={clinic.id}
          center={[clinic.clinicLatitude, clinic.clinicLongitude]}
          pathOptions={{ color: "#16a34a" }}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">
                {clinic.clinicName || clinic.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {[clinic.clinicAddress, clinic.clinicCity, clinic.clinicState, clinic.clinicCountry]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
