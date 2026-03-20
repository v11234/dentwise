import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DoctorAppointmentNotificationEmailProps {
  doctorName: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: string;
}

function DoctorAppointmentNotificationEmail({
  doctorName,
  patientName,
  patientEmail,
  appointmentDate,
  appointmentTime,
  appointmentType,
  duration,
}: DoctorAppointmentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New appointment request from {patientName || "a patient"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Appointment Request</Heading>

          <Text style={text}>Hello Dr. {doctorName},</Text>
          <Text style={text}>
            A new patient appointment request is waiting for your approval. Details are below:
          </Text>

          <Section style={appointmentDetails}>
            <Text style={detailLabel}>Patient</Text>
            <Text style={detailValue}>{patientName || "Patient name not provided"}</Text>

            <Text style={detailLabel}>Patient Email</Text>
            <Text style={detailValue}>{patientEmail}</Text>

            <Text style={detailLabel}>Appointment Type</Text>
            <Text style={detailValue}>{appointmentType}</Text>

            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{appointmentDate}</Text>

            <Text style={detailLabel}>Time</Text>
            <Text style={detailValue}>{appointmentTime}</Text>

            <Text style={detailLabel}>Duration</Text>
            <Text style={detailValue}>{duration}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Link style={button} href={process.env.NEXT_PUBLIC_APP_URL + "/doctor"}>
              Open Doctor Dashboard
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DoctorAppointmentNotificationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "24px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0 24px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "10px 0",
};

const appointmentDetails = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "8px 0 4px 0",
};

const detailValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0 0 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

