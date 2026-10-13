import { TicketPage } from "@/components/booking";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <TicketPage id={(await params).id} />;
}
