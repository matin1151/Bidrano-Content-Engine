import { Suspense } from "react";
import NewOrderForm from "../NewOrderForm";

export default function SuggestionOrder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}