import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import config from "@/lib/config";

interface OTPEmailProps {
  otp: string;
}

export function OTPEmail({ otp }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your sign-in code for {config.project.name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your sign-in code</Heading>
          <Text style={text}>
            Use this code to sign in to {config.project.name}:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 10 minutes. If you didn&apos;t request
            this code, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const codeContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "26px 0",
  padding: "20px",
  textAlign: "center" as const,
};

const code = {
  color: "#000",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
};

export default OTPEmail;

