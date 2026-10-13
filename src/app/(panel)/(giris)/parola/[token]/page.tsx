import type { Metadata } from "next";
import { ResetForm } from "@/panel/auth/forms";

export const metadata: Metadata = { title: "Parolanızı belirleyin" };

/** Davet ve parola yenileme e-postasındaki bağlantı */
export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetForm token={token} />;
}
