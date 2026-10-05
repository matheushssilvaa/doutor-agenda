"use server"

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { upsertAppointmentSchema } from "./schema";

dayjs.extend(utc);
dayjs.extend(timezone);

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

		// O paciente precisa pertencer à clínica do usuário logado
		// (o médico é validado em getAvailableTimes)
		const patient = await db.query.patientsTable.findFirst({
			where: and(
				eq(patientsTable.id, parsedInput.patientId),
				eq(patientsTable.clinicId, session.user.clinic.id)
			)
		})
		if (!patient) {
			throw new Error("Paciente não encontrado")
		}

		const availableTimes = await getAvailableTimes({
			doctorId: parsedInput.doctorId,
			date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
			appointmentId: parsedInput.id
		})

		const isTimeAvailable = availableTimes?.data?.some(
			(time) => time.value == parsedInput.time && time.available
		)

		if (!isTimeAvailable) {
			throw new Error("Time not available")
		}

		const dateString = dayjs(parsedInput.date).format("YYYY-MM-DD");

		const appointmentDateTime = dayjs.tz(
			`${dateString} ${parsedInput.time}`,
			"America/Sao_Paulo"
		).toDate();

		try {
			if (parsedInput.id) {
				await db
					.update(appointmentsTable)
					.set({
						date: appointmentDateTime,
						clinicId: session?.user?.clinic?.id,
						patientId: parsedInput.patientId,
						doctorId: parsedInput.doctorId,
						appointmentInCents: parsedInput.appointmentPriceInCents,
						updatedAt: new Date(),
					})
					.where(and(
						eq(appointmentsTable.id, parsedInput.id),
						eq(appointmentsTable.clinicId, session.user.clinic.id)
					))
			} else {
				await db
					.insert(appointmentsTable)
					.values({
						date: appointmentDateTime,
						clinicId: session?.user?.clinic?.id,
						patientId: parsedInput.patientId,
						doctorId: parsedInput.doctorId,
						appointmentInCents: parsedInput.appointmentPriceInCents
					})
			}

			revalidatePath("/appointments")
			return { success: true }
		} catch (error) {
			throw new Error("Internal server error" + error)
		}
	})