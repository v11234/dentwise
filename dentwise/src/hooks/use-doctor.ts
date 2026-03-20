"use client";

import {
  getDoctorAppointments,
  getDoctorProfile,
  updateDoctorAppointmentStatus,
} from "@/lib/actions/doctor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDoctorProfile() {
  return useQuery({
    queryKey: ["getDoctorProfile"],
    queryFn: getDoctorProfile,
  });
}

export function useDoctorAppointments() {
  return useQuery({
    queryKey: ["getDoctorAppointments"],
    queryFn: getDoctorAppointments,
  });
}

export function useUpdateDoctorAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctorAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctorAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error) => console.error("Failed to update appointment status:", error),
  });
}
