export interface AppointmentReceiptData {
  appointmentId: string;
  patientName: string;
  userEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  price: string;
  status: string;
}

export async function downloadAppointmentReceiptPdf(data: AppointmentReceiptData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const receiptNo = `RCP-${data.appointmentId.slice(-8).toUpperCase()}`;
  const issuedAt = new Date().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const right = pageWidth - 16;
  const brand = {
    primary: [20, 83, 45] as const,
    muted: [89, 98, 107] as const,
    border: [226, 232, 240] as const,
    light: [247, 250, 252] as const,
  };

  const drawLabelValue = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...brand.muted);
    doc.text(label, x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(value || "-", x, y + 5.5);
  };

  const summaryRows: Array<[string, string]> = [
    ["Patient", data.patientName || "Patient"],
    ["Email", data.userEmail],
    ["Doctor", data.doctorName],
    ["Date", data.appointmentDate],
    ["Time", data.appointmentTime],
    ["Status", data.status || "PENDING"],
  ];

  // Top brand ribbon
  doc.setFillColor(...brand.primary);
  doc.rect(0, 0, pageWidth, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DentWise", 16, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Appointment Receipt", 16, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(receiptNo, right, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Issued: ${issuedAt}`, right, 20, { align: "right" });

  // Metadata row
  doc.setDrawColor(...brand.border);
  doc.setFillColor(...brand.light);
  doc.roundedRect(16, 41, pageWidth - 32, 22, 2, 2, "FD");
  drawLabelValue("Appointment ID", data.appointmentId, 22, 49);
  drawLabelValue("Receipt", receiptNo, 95, 49);
  drawLabelValue("Issued", issuedAt, 145, 49);

  // Appointment details card
  doc.setDrawColor(...brand.border);
  doc.roundedRect(16, 72, pageWidth - 32, 78, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("Appointment Details", 22, 82);

  let detailY = 93;
  summaryRows.forEach(([label, value], index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...brand.muted);
    doc.text(label, 22, detailY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(value || "-", 80, detailY);

    if (index < summaryRows.length - 1) {
      doc.setDrawColor(...brand.border);
      doc.line(22, detailY + 3.8, right - 6, detailY + 3.8);
    }
    detailY += 11;
  });

  // Billing table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("Billing", 22, 164);

  doc.setFillColor(...brand.light);
  doc.roundedRect(16, 170, pageWidth - 32, 36, 2, 2, "F");
  doc.setDrawColor(...brand.border);
  doc.roundedRect(16, 170, pageWidth - 32, 36, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...brand.muted);
  doc.text("Description", 22, 180);
  doc.text("Amount", right - 8, 180, { align: "right" });

  doc.setDrawColor(...brand.border);
  doc.line(22, 184, right - 8, 184);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(data.appointmentType || "General consultation", 22, 192);
  doc.text(data.price || "N/A", right - 8, 192, { align: "right" });

  doc.setDrawColor(...brand.border);
  doc.line(22, 196, right - 8, 196);

  doc.setFont("helvetica", "bold");
  doc.text("Total", 22, 202);
  doc.text(data.price || "N/A", right - 8, 202, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...brand.muted);
  doc.text("Thank you for choosing DentWise.", 16, 230);
  doc.text("This receipt confirms your appointment booking.", 16, 235);
  doc.text("Need help? support@dentwise.com", 16, 240);

  doc.save(`${receiptNo.toLowerCase()}.pdf`);
}
