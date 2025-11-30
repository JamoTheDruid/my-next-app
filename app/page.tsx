import { db } from "@/lib/db";

export default async function Home() {
  const customers = await db.customer.findMany({
    include: { properties: true }
  });
  const properties = await db.property.findMany();

  return (
        <div>
          <h1>Customers</h1>
          <pre>{JSON.stringify(customers, null, 2)}</pre>
          <h1>Customer Properties</h1>
          <pre>{JSON.stringify(properties, null, 2)}</pre>
        </div>
  );
}
