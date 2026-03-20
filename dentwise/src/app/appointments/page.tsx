"use client";

import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointment";
import { downloadAppointmentReceiptPdf } from "@/lib/receipt";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/components/LocaleProvider";
import { DATE_FNS_LOCALES } from "@/lib/i18n";

const FCFA_EXCHANGE_RATE = Number(process.env.NEXT_PUBLIC_FCFA_EXCHANGE_RATE || "600");
const TEST_PAYMENT_FCFA = 20;

function parseUsdFromPrice(price: string | undefined) {
  if (!price) return 0;
  const match = price.match(/\$([\d.]+)/);
  if (!match) return 0;
  return Number(match[1]);
}

interface AppointmentReceiptItem {
  id: string;
  doctorName: string;
  doctorImageUrl: string;
  reason?: string | null;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  status: string;
}

function AppointmentsPage() {
  const { t, locale } = useTranslations();
  const dateFnsLocale = DATE_FNS_LOCALES[locale];
  // state management for the booking process - this could be done with something like Zustand for larger apps
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: select dentist, 2: select time, 3: confirm
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<AppointmentReceiptItem | null>(null);

  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [] } = useUserAppointments();

  const handleDownloadReceipt = async (appointment: AppointmentReceiptItem) => {
    const amount = APPOINTMENT_TYPES.find((t) => t.name === appointment.reason)?.price || "N/A";
    await downloadAppointmentReceiptPdf({
      appointmentId: appointment.id,
      patientName: appointment.patientName || "Patient",
      userEmail: appointment.patientEmail,
      doctorName: appointment.doctorName,
      appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy", {
        locale: dateFnsLocale,
      }),
      appointmentTime: appointment.time,
      appointmentType: appointment.reason || "General consultation",
      price: amount,
      status: appointment.status || "PENDING",
    });
  };

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);

    // reset the state when dentist changes
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
  };

  const handleBookAppointment = async () => {
    if (!selectedDentistId || !selectedDate || !selectedTime) {
      toast.error(t("appointments.page.missingFields"));
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);
    const appointmentAmountUsd = parseUsdFromPrice(appointmentType?.price);
    const requiredAmountCFA = appointmentAmountUsd > 0 ? Math.round(appointmentAmountUsd * FCFA_EXCHANGE_RATE) : TEST_PAYMENT_FCFA;

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentType?.name,
        paidAmountCFA: requiredAmountCFA,
      },
      {
        onSuccess: async (appointment) => {
          // store the appointment details to show in the modal
          setBookedAppointment(appointment);

          try {
            const emailResponse = await fetch("/api/send-appointment-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userEmail: appointment.patientEmail,
                patientName: appointment.patientName,
                doctorEmail: appointment.doctorEmail,
                doctorName: appointment.doctorName,
                appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy", {
                  locale: dateFnsLocale,
                }),
                appointmentTime: appointment.time,
                appointmentType: appointmentType?.name,
                duration: appointmentType?.duration,
                price: appointmentType?.price,
              }),
            });

            const details = await emailResponse.json().catch(() => ({}));

            if (!emailResponse.ok) {
              console.error("Failed to send appointment emails", details);
              toast.warning(t("appointments.toasts.emailFailed"));
            } else if (details?.userEmailSent === false || details?.doctorEmailSent === false) {
              if (details?.userEmailSent === false) {
                const message =
                  typeof details?.userError === "string" && details.userError.trim().length > 0
                    ? t("appointments.toasts.patientEmailFailedWithError", {
                        error: details.userError,
                      })
                    : t("appointments.toasts.patientEmailFailed");
                toast.warning(message);
              }

              if (details?.doctorEmailSent === false) {
                const message =
                  typeof details?.doctorError === "string" && details.doctorError.trim().length > 0
                    ? t("appointments.toasts.doctorEmailFailedWithError", {
                        error: details.doctorError,
                      })
                    : t("appointments.toasts.doctorEmailFailed");
                toast.warning(message);
              }
            } else {
              toast.success(t("appointments.toasts.emailSent"));
            }
          } catch (error) {
            console.error("Error sending appointment emails:", error);
            toast.warning(t("appointments.toasts.emailSendingFailed"));
          }

          // show the success modal
          setShowConfirmationModal(true);

          // reset form
          setSelectedDentistId(null);
          setSelectedDate("");
          setSelectedTime("");
          setSelectedType("");
          setCurrentStep(1);
        },
        onError: (error) =>
          toast.error(t("appointments.page.bookingFailed", { message: error.message })),
      }
    );
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("appointments.page.title")}</h1>
          <p className="text-muted-foreground">{t("appointments.page.subtitle")}</p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {currentStep === 1 && (
          <DoctorSelectionStep
            selectedDentistId={selectedDentistId}
            onContinue={() => setCurrentStep(2)}
            onSelectDentist={handleSelectDentist}
          />
        )}

        {currentStep === 2 && selectedDentistId && (
          <TimeSelectionStep
            selectedDentistId={selectedDentistId}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedType={selectedType}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
            onTypeChange={setSelectedType}
          />
        )}

        {currentStep === 3 && selectedDentistId && (
          <BookingConfirmationStep
            selectedDentistId={selectedDentistId}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedType={selectedType}
            isBooking={bookAppointmentMutation.isPending}
            onBack={() => setCurrentStep(2)}
            onModify={() => setCurrentStep(2)}
            onConfirm={handleBookAppointment}
          />
        )}
      </div>

      {bookedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
            appointmentDetails={{
              appointmentId: bookedAppointment.id,
              doctorName: bookedAppointment.doctorName,
              appointmentDate: format(new Date(bookedAppointment.date), "EEEE, MMMM d, yyyy", {
                locale: dateFnsLocale,
              }),
              appointmentTime: bookedAppointment.time,
              userEmail: bookedAppointment.patientEmail,
              patientName: bookedAppointment.patientName,
              appointmentType: bookedAppointment.reason || "General consultation",
            price: APPOINTMENT_TYPES.find((t) => t.name === (bookedAppointment.reason ?? ""))?.price,
            status: bookedAppointment.status,
          }}
        />
      )}

      {/* SHOW EXISTING APPOINTMENTS FOR THE CURRENT USER */}
      {userAppointments.length > 0 && (
        <div className="mb-8 max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">{t("appointments.page.upcoming")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(userAppointments as AppointmentReceiptItem[]).map((appointment) => (
              <div key={appointment.id} className="bg-card border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-full overflow-hidden">
                      <Image
                        src={appointment.doctorImageUrl || "/default-avatar.png"}
                        alt={appointment.doctorName}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{appointment.doctorName}</p>
                      <p className="text-muted-foreground text-xs">{appointment.reason}</p>
                      <p className="text-xs text-primary mt-1">{appointment.status}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownloadReceipt(appointment)}
                    aria-label={t("appointments.page.downloadReceipt")}
                    title={t("appointments.page.downloadReceipt")}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    📅 {format(new Date(appointment.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">🕐 {appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default AppointmentsPage;
