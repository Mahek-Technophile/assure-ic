import AdminDetailClient from "../../../components/AdminDetailClient";

export async function generateStaticParams() {
  return [
    { id: "demo" },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  return <AdminDetailClient requestId={params.id} />;
}
