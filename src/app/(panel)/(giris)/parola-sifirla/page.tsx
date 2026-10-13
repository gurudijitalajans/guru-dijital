import type { Metadata } from "next";
import { ForgotForm } from "@/panel/auth/forms";

export const metadata: Metadata = { title: "Parolanızı yenileyin" };

export default function ForgotPage() {
  return <ForgotForm />;
}
