"use server"

import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

dayjs.extend(utc)
dayjs.extend(timezone)

// Horários digitados no formulário estão no horário de Brasília;
// convertemos explicitamente, pois o servidor (ex.: Vercel) roda em UTC.
const TIME_ZONE = "America/Sao_Paulo"

export const upsertDoctor = actionClient.schema(upsertDoctorSchema)
	.action(async ({ parsedInput }) => {

		// conversão de datas para UTC
		const availableFromTime = parsedInput.availableFromTime
		const availableToTime = parsedInput.availableToTime

		const today = dayjs().tz(TIME_ZONE).format("YYYY-MM-DD")
		const availableFromTimeUTC = dayjs.tz(`${today} ${availableFromTime}`, TIME_ZONE).utc()
		const availableToTimeUTC = dayjs.tz(`${today} ${availableToTime}`, TIME_ZONE).utc()

		const session = await auth.api.getSession({
			headers: await headers()
		})

		if (!session?.user) {
			throw new Error("Unauthorized")
		}

		if (!session?.user.clinic?.id) {
			throw new Error("Clinic not found")
		}

		// Ao editar, o médico precisa pertencer à clínica do usuário logado
		if (parsedInput.id) {
			const doctor = await db.query.doctorsTable.findFirst({
				where: eq(doctorsTable.id, parsedInput.id)
			})
			if (doctor && doctor.clinicId !== session.user.clinic.id) {
				throw new Error("Médico não encontrado")
			}
		}

		await db.
			insert(doctorsTable)
			.values({
				...parsedInput,
				id: parsedInput.id,
				clinicId: session?.user.clinic?.id,
				availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
				availableToTime: availableToTimeUTC.format("HH:mm:ss")
			})
			.onConflictDoUpdate({
				target: [doctorsTable.id],
				set: {
					...parsedInput,
					availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
					availableToTime: availableToTimeUTC.format("HH:mm:ss")
				}
			})
		revalidatePath("/doctors")
	})