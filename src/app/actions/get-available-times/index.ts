"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
	.schema(
		z.object({
			doctorId: z.string(),
			date: z.string().date(),
			// Quando estamos editando um agendamento, o horário dele não deve
			// ser considerado ocupado.
			appointmentId: z.string().optional(),
		}),
	)
	.action(async ({ parsedInput }) => {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session) {
			throw new Error("Unauthorized");
		}
		if (!session.user.clinic) {
			throw new Error("Clínica não encontrada");
		}
		const doctor = await db.query.doctorsTable.findFirst({
			where: and(
				eq(doctorsTable.id, parsedInput.doctorId),
				eq(doctorsTable.clinicId, session.user.clinic.id),
			),
		});
		if (!doctor) {
			throw new Error("Médico não encontrado");
		}
		const selectedDayOfWeek = dayjs(parsedInput.date).day();
		const doctorIsAvailable =
			selectedDayOfWeek >= doctor.availableFromWeekDay &&
			selectedDayOfWeek <= doctor.availableToWeekDay;
		if (!doctorIsAvailable) {
			return [];
		}

		const appointments = await db.query.appointmentsTable.findMany({
			where: and(
				eq(appointmentsTable.doctorId, parsedInput.doctorId),
				eq(appointmentsTable.clinicId, session.user.clinic.id)
			),
		});

		const appointmentsOnSelectedDate = appointments
			.filter((appointment) => {
				if (parsedInput.appointmentId && appointment.id === parsedInput.appointmentId) {
					return false;
				}
				return dayjs(appointment.date).tz("America/Sao_Paulo").isSame(parsedInput.date, "day");
			})
			.map((appointment) => {
				return dayjs(appointment.date).tz("America/Sao_Paulo").format("HH:mm:ss");
			});

		const timeSlots = generateTimeSlots();

		// A disponibilidade do médico é salva em UTC e os horários (slots) são
		// exibidos/agendados no horário de Brasília. Convertemos explicitamente,
		// pois o servidor (ex.: Vercel) roda em UTC.
		const toLocalTime = (utcTime: string) =>
			dayjs
				.utc(`${parsedInput.date} ${utcTime}`)
				.tz("America/Sao_Paulo")
				.format("HH:mm:ss");
		const doctorAvailableFrom = toLocalTime(doctor.availableFromTime);
		const doctorAvailableTo = toLocalTime(doctor.availableToTime);
		const doctorTimeSlots = timeSlots.filter((time) => {
			return time >= doctorAvailableFrom && time <= doctorAvailableTo;
		});
		return doctorTimeSlots.map((time) => {
			return {
				value: time,
				available: !appointmentsOnSelectedDate.includes(time),
				label: time.substring(0, 5),
			};
		});
	});