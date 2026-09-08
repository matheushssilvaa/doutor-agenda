"use server"

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const deleteManyPatients = actionClient
	.schema(z.array(z.string().uuid()).min(1))
	.action(async ({ parsedInput: patientsIds }) => {
		const session = await auth.api.getSession({
			headers: await headers()
		})

		if (!session?.user?.clinic?.id) {
			throw new Error("Unauthorized")
		}

		const clinicId = session.user.clinic.id

		// 1. Deleta apenas os pacientes que pertencem à clínica do usuário logado
		const deletedPatients = await db
			.delete(patientsTable)
			.where(
				and(
					inArray(patientsTable.id, patientsIds),
					eq(patientsTable.clinicId, clinicId)
				)
			)
			.returning({ id: patientsTable.id });

		if (deletedPatients.length === 0) {
			throw new Error("Nenhum paciente encontrado ou você não tem permissão.")
		}

		revalidatePath("/patients")

		return { success: true, deletedCount: deletedPatients.length };
	})