import db from "@/lib/db";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return <div>Missing lead id in URL.</div>;

  const lead = await db.angiLead.findUnique({
    where: { id },
  });

  if (!lead) return <div>Lead not found</div>;

  return (
    <div>
      <h1>{lead.name}</h1>
      <p>{lead.primaryPhone}</p>
      <p>{lead.address}</p>
      <p>{lead.comments}</p>
    </div>
  );
}