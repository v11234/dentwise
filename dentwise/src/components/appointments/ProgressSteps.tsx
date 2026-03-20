"use client";

import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "@/components/LocaleProvider";

function ProgressSteps({ currentStep }: { currentStep: number }) {
  const { t } = useTranslations();
  const steps = [
    t("appointments.steps.selectDentist"),
    t("appointments.steps.chooseTime"),
    t("appointments.steps.confirm"),
  ];
  return (
    <div className="flex items-center gap-4 mb-8">
      {steps.map((stepName, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;

        return (
          <div key={stepNumber} className="flex items-center gap-2">
            {/* step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {stepNumber}
            </div>

            {/* step name */}
            <span className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {stepName}
            </span>

            {/* arrow (not shown for last step) */}
            {stepNumber < steps.length && (
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}
export default ProgressSteps;
