import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MobileMoneyPaymentSuccessEmailProps {
  plan: string;
  amount: string;
  paymentId: string;
  paidAt: string;
}

function MobileMoneyPaymentSuccessEmail({
  plan,
  amount,
  paymentId,
  paidAt,
}: MobileMoneyPaymentSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your mobile money payment was successful</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Confirmed</Heading>
          <Text style={text}>
            Your mobile money payment has been received and your DentWise plan is now active.
          </Text>

          <Section style={card}>
            <Text style={label}>Plan</Text>
            <Text style={value}>{plan}</Text>
            <Text style={label}>Amount</Text>
            <Text style={value}>{amount}</Text>
            <Text style={label}>Payment ID</Text>
            <Text style={value}>{paymentId}</Text>
            <Text style={label}>Paid At</Text>
            <Text style={value}>{paidAt}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>Thank you for choosing DentWise.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MobileMoneyPaymentSuccessEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "24px",
};

const h1 = {
  color: "#0f172a",
  fontSize: "24px",
  margin: "0 0 12px",
};

const text = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 18px",
};

const card = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "14px",
};

const label = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0",
};

const value = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 10px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "18px 0",
};

const footer = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0",
};
