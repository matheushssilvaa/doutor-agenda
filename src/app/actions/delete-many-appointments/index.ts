"use server"

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const deleteManyAppointments = actionClient
	.schema(z.array(z.string().uuid()).min(1))
	.action(async ({ parsedInput: appointmentIds }) => {
		const session = await auth.api.getSession({
			headers: await headers()
		})

		if (!session?.user?.clinic?.id) {
			throw new Error("Unauthorized")
		}

		const clinicId = session.user.clinic.id

		// 1. Deleta apenas os agendamentos que pertencem à clínica do usuário logado
		const deletedAppointments = await db
			.delete(appointmentsTable)
			.where(
				and(
					inArray(appointmentsTable.id, appointmentIds),
					eq(appointmentsTable.clinicId, clinicId)
				)
			)
			.returning({ id: appointmentsTable.id });

		if (deletedAppointments.length === 0) {
			throw new Error("Nenhum agendamento encontrado ou você não tem permissão.")
		}

		revalidatePath("/appointments")

		return { success: true, deletedCount: deletedAppointments.length };
	})