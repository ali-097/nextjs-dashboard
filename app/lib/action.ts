"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["paid", "pending"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

const updateInvoice = FormSchema.omit({ id: true, date: true });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(formData: FormData) {
  //   const rawFromData = {
  //     cusomterId: formdata.get("customerId"),
  //     amount: formdata.get("amount"),
  //     status: formdata.get("status"),
  //   };

  //   const rawFromData = Object.fromEntries(formdata);
  console.log(formData);
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  await sql`INSERT INTO INVOICES (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function UpdateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = updateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;

  await sql`UPDATE INVOICES SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM INVOICES WHERE id = ${id}`;

  revalidatePath("/dashboard/invoices");
}
