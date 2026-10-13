import { VerifyPage } from "@/components/booking";
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <VerifyPage token={(await params).token} />;
}
