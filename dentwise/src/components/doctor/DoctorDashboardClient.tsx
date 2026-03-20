"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircleIcon, CalendarIcon, CheckCircle2Icon, UserIcon } from "lucide-react";
import DoctorPaymentPanel from "./DoctorPaymentPanel";
import { useDoctorAppointments, useDoctorProfile, useUpdateDoctorAppointmentStatus } from "@/hooks/use-doctor";

export default function DoctorDashboardClient() {
  const { data: doctor, isLoading: profileLoading } = useDoctorProfile();
  const { data: appointments = [], isLoading: appointmentsLoading } = useDoctorAppointments();
  const updateStatus = useUpdateDoctorAppointmentStatus();

  const isLoading = profileLoading || appointmentsLoading;

  const stats = useMemo(() => {
    const pending = appointments.filter((appt) => appt.status === "PENDING").length;
    const accepted = appointments.filter((appt) => appt.status === "ACCEPTED").length;
    const rejected = appointments.filter((appt) => appt.status === "REJECTED").length;
    return {
      total: appointments.length,
      pending,
      accepted,
      rejected,
    };
  }, [appointments]);

  const patients = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>();
    appointments.forEach((appt) => {
      if (appt.patientEmail && !map.has(appt.patientEmail)) {
        map.set(appt.patientEmail, {
          name: appt.patientName || "Patient",
          email: appt.patientEmail,
        });
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-semibold">Doctor profile not found.</p>
        <p className="text-sm mt-1">
          Complete your doctor registration to access professional tools.
        </p>
      </div>
    );
  }

  const isActive = doctor.accountStatus === "ACTIVE";

  return (
    <div className="space-y-8">
      {!isActive && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-2xl font-semibold">Activate your professional account</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your documents are on file. Complete the professional fee to unlock full doctor
              tools. You can still review patient bookings below.
            </p>
          </div>
          <DoctorPaymentPanel fee={Number(process.env.NEXT_PUBLIC_DOCTOR_PRO_FEE || "50000")} />
        </div>
      )}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {isActive ? (
                <>
                  <CheckCircle2Icon className="h-4 w-4" />
                  Professional account active
                </>
              ) : (
                <>
                  <AlertCircleIcon className="h-4 w-4" />
                  Professional account pending
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold">Welcome, {doctor.name}</h1>
            <p className="text-muted-foreground">
              Manage your appointment requests and keep track of your patients.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground">
            <div>{doctor.clinicName || "Clinic"}</div>
            <div>{doctor.clinicCity || doctor.clinicState || ""}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Accepted appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected requests</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No appointment requests yet.</div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="font-medium">{appointment.patientName || "Patient"}</div>
                        <div className="text-xs text-muted-foreground">{appointment.patientEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-xs text-muted-foreground">{appointment.time}</div>
                      </TableCell>
                      <TableCell>{appointment.reason || "General consultation"}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        {appointment.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!isActive}
                              onClick={() =>
                                updateStatus.mutate({ id: appointment.id, status: "REJECTED" })
                              }
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              disabled={!isActive}
                              onClick={() =>
                                updateStatus.mutate({ id: appointment.id, status: "ACCEPTED" })
                              }
                            >
                              Accept
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-sm text-muted-foreground">No patients yet.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <div key={patient.email} className="rounded-xl border border-border/60 p-4">
                  <div className="font-semibold">{patient.name}</div>
                  <div className="text-xs text-muted-foreground">{patient.email}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <AlertCircleIcon className="h-4 w-4 text-primary" />
          Remember: appointment requests must be accepted to confirm a booking.
        </CardContent>
      </Card>
    </div>
  );
}
