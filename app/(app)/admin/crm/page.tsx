// app/admin/customers/page.tsx
import { getCurrentUser } from "@/lib/user";
import FloatingField from "@/components/FloatingField";
import CustomerForm from "./CustomerForm";
import styles from "./page.module.css";
import db from "@/lib/db";
import { createCustomerFromForm, type CustomerActionState } from "./actions";
import Link from "next/link";
//import { useActionState } from "react";

//const initialState: CustomerActionState = { ok: true };

export default async function CustomersPage() {

	const [user, currentUser] = await Promise.all([
	db.customer.findMany({
		orderBy: { createdAt: "desc" },
		/*select: { name: true, email: true, telephone: true, addressRaw: true }*/
	}),
	getCurrentUser()
	]);

  return (
    <div style={{ padding: "1rem" }}>
		<h1>Customers</h1>
		<p>Welcome, {currentUser?.email}</p>
		<p>Your role: {currentUser?.roleKeys}</p>
			<CustomerForm />
			<h2>Customer List</h2>
			<div className={styles.customerList}>
				{user.map((customer) => (
					<Link className={styles.customerLink}key={customer.id} href={`/admin/customers/${customer.id}`}>
						{customer.name} - {customer.email} - {customer.telephone} - {customer.addressRaw}
					</Link>
				))}
			</div>
    </div>
  );
}