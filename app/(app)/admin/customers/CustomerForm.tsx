"use client";
import styles from "./page.module.css";
import { createCustomerFromForm, type CustomerActionState } from "./actions";
import Form from "next/form";
import { useActionState } from "react";
import FloatingField from "@/components/FloatingField";

export default function CustomerForm() {
	const initialState: CustomerActionState = { 
		ok: true
	};
	const [state, formAction] = useActionState(createCustomerFromForm, initialState);
		
	return (
		<div>
			<h2>Add Customer</h2>
			<Form className={styles.form} action={formAction}>
				<FloatingField
					id="name"
					label="Name"
					name="name"
					type="name"
					autoComplete="name"
				/>
				<FloatingField
					id="email"
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
				/>
				<FloatingField
					id="tel"
					label="Phone Number"
					name="tel"
					type="tel"
					autoComplete="tel"
				/>
				<FloatingField
					id="address"
					label="Address"
					name="address"
					type="address"
					autoComplete="address"
				/>
				<button className={styles.submit} name="submit" type="submit">Add Customer</button>
			</Form>
		</div>
		)
}