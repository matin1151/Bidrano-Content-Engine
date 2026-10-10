
import CustomerProfile from "./CustomerProfile";

export default async function CustomerById({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerProfile key={id} id={id} />;
}
