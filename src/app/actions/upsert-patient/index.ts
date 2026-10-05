"use server"

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

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
					.where(and(
						eq(patientsTable.id, parsedInput.id),
						eq(patientsTable.clinicId, session.user.clinic.id)
					))
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
		} catch (error) {
			// Captura erro de email duplicado
			const dbError = error as { code?: string; message?: string }
			if (dbError.code === '23505' || dbError.message?.includes('email')) {
				throw new Error("Este email está sendo usado, tente novamente.")
			}
			throw error
		}
	})