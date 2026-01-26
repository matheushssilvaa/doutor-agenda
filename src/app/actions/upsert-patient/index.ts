"use server"

import { db } from "@/db";
import { upsertPatientSchema } from "./schema";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const upsertPatient = actionClient.schema(upsertPatientSchema)
	.action(async ({ parsedInput }) => {

		const session = await auth.api.getSession({
			headers: await headers()
		})

		if (!session?.user) {
			throw new Error("Unauthorized")
		}

		if (!session?.user.clinic?.id) {
			throw new Error("Clinic not found")
		}

		try {
			if (parsedInput.id) {
				await db
					.update(patientsTable)
					.set({
						...parsedInput,
						updatedAt: new Date(),
					})
					.where(eq(patientsTable.id, parsedInput.id))
			} else {
				await db
					.insert(patientsTable)
					.values({
						...parsedInput,
						id: parsedInput.id,
						clinicId: session.user.clinic.id,
					})
			}

			revalidatePath("/patients")
			return { success: true }
		} catch (error: any) {
			// Captura erro de email duplicado
			if (error.code === '23505' || error.message?.includes('email')) {
				throw new Error("Este email está sendo usado, tente novamente.")
			}
			throw error
		}
	})