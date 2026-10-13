import { Suspense } from "react";
import { BookPage } from "@/components/booking";
import { Loading } from "@/components/site";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <BookPage id={id} />
    </Suspense>
  );
}
