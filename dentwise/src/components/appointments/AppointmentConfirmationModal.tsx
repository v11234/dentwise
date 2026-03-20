"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DownloadIcon,
} from "lucide-react";
import { downloadAppointmentReceiptPdf } from "@/lib/receipt";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/components/LocaleProvider";

interface AppointmentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentDetails: {
    appointmentId: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    userEmail: string;
    patientName?: string;
    appointmentType?: string;
    price?: string;
    status?: string;
  };
}

export function AppointmentConfirmationModal({
  open,
  onOpenChange,
  appointmentDetails,
}: AppointmentConfirmationModalProps) {
  const { t } = useTranslations();
  const handleDownloadReceipt = async () => {
    if (!appointmentDetails) return;
    await downloadAppointmentReceiptPdf({
      appointmentId: appointmentDetails.appointmentId,
      patientName: appointmentDetails.patientName || t("doctor.patientFallback"),
      userEmail: appointmentDetails.userEmail,
      doctorName: appointmentDetails.doctorName,
      appointmentDate: appointmentDetails.appointmentDate,
      appointmentTime: appointmentDetails.appointmentTime,
      appointmentType: appointmentDetails.appointmentType || t("doctor.reasonFallback"),
      price: appointmentDetails.price || "N/A",
      status: appointmentDetails.status || "PENDING",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircleIcon className="h-8 w-8 text-primary" />
          </div>

          <DialogTitle className="text-xl font-semibold text-center">
            {t("appointments.modal.title")}
          </DialogTitle>

          <DialogDescription className="text-center text-muted-foreground">
            {t("appointments.modal.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Notification Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Image
                src="/email-sent.png"
                alt="Email sent"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <MailIcon className="h-4 w-4" />
                {t("appointments.modal.emailTitle")}
              </div>
              {appointmentDetails?.userEmail && (
                <p className="text-xs text-muted-foreground">{appointmentDetails.userEmail}</p>
              )}
            </div>
          </div>

          {/* Appointment Summary */}
          {appointmentDetails && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-center mb-3">{t("appointments.modal.summaryTitle")}</h4>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{appointmentDetails.doctorName}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{appointmentDetails.appointmentDate}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{appointmentDetails.appointmentTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button variant="secondary" className="w-full" onClick={handleDownloadReceipt}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              {t("appointments.modal.download")}
            </Button>

            <Link href="/appointments" className="w-full">
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                {t("appointments.modal.viewAppointments")}
              </Button>
            </Link>

            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              {t("appointments.modal.close")}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>{t("appointments.modal.footer")}</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
