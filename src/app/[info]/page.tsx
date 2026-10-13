import { notFound } from "next/navigation";
import { InfoPage } from "@/components/public-pages";
export default async function Page({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  if (
    !["routes", "fleet", "about", "contact", "help", "schedules"].includes(info)
  )
    notFound();
  return <InfoPage kind={info === "schedules" ? "routes" : info} />;
}
