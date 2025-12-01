//import db from "@/lib/db";

export default async function Home() {
  /*const customers = await db.customer.findMany({
    include: { properties: true }
  });
  const properties = await db.property.findMany();*/

  return (
        <div>
          <h1>Welcome to the Druidic! You can sign in to see your landscaping schedule, billing information, and property details </h1>
        </div>
  );
}
