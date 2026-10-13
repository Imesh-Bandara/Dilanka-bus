import { Suspense } from "react";
import { SearchPage } from "@/components/public-pages";
import { Loading } from "@/components/site";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPage />
    </Suspense>
  );
}
