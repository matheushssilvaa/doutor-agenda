"use server"

import { db } from "@/db";
import { upsertAppointmentSchema } from "./schema";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const upsertAppointment = actionClient.schema(upsertAppointmentSchema)
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
					.update(appointmentsTable)
					.set({
						...parsedInput,
						clinicId: session?.user?.clinic?.id,
						patientId: parsedInput.patientId,
						doctorId: parsedInput.doctorId,
						appointmentInCents: parsedInput.appointmentPriceInCents,
						updatedAt: new Date(),
					})
					.where(eq(appointmentsTable.id, parsedInput.id))
			} else {
				await db
					.insert(appointmentsTable)
					.values({
						...parsedInput,
						clinicId: session?.user?.clinic?.id,
						patientId: parsedInput.patientId,
						doctorId: parsedInput.doctorId,
						appointmentInCents: parsedInput.appointmentPriceInCents
					})
			}

			revalidatePath("/appointments")
			return { success: true }
		} catch (error: any) {
			throw new Error("Internal server error" + error)
		}
	})