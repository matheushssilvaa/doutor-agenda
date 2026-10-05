import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

dayjs.extend(utc);
dayjs.extend(timezone);

// O servidor (ex.: Vercel) roda em UTC; os "dias" do dashboard seguem o horário de Brasília.
const TIME_ZONE = "America/Sao_Paulo";

// As datas são gravadas em UTC (timestamp sem fuso), então convertemos para o dia local.
const appointmentLocalDate = () =>
	sql<string>`DATE((${appointmentsTable.date} AT TIME ZONE 'UTC') AT TIME ZONE ${sql.raw(`'${TIME_ZONE}'`)})`;

interface Params {
	from: string;
	to: string;
	session: {
		user: {
			clinic: {
				id: string;
			};
		};
	};
}

export const getDashboard = async ({ from, to, session }: Params) => {
	const now = dayjs().tz(TIME_ZONE);
	const chartStartDate = now.subtract(10, "days").startOf("day").toDate();
	const chartEndDate = now.add(10, "days").endOf("day").toDate();

	const startOfToday = now.startOf("day").toDate();
	const endOfToday = now.endOf("day").toDate();

	const fromDate = dayjs.tz(from, TIME_ZONE).startOf("day").toDate();
	const toDate = dayjs.tz(to, TIME_ZONE).endOf("day").toDate();

	const [
		[totalRevenue],
		[totalAppointments],
		[totalPatients],
		[totalDoctors],
		topDoctors,
		topSpecialties,
		todayAppointments,
		dailyAppointmentsData,
	] = await Promise.all([
		db
			.select({
				total: sum(appointmentsTable.appointmentInCents),
			})
			.from(appointmentsTable)
			.where(
				and(
					eq(appointmentsTable.clinicId, session.user.clinic.id),
					gte(appointmentsTable.date, fromDate),
					lte(appointmentsTable.date, toDate),
				),
			),
		db
			.select({
				total: count(),
			})
			.from(appointmentsTable)
			.where(
				and(
					eq(appointmentsTable.clinicId, session.user.clinic.id),
					gte(appointmentsTable.date, fromDate),
					lte(appointmentsTable.date, toDate),
				),
			),
		db
			.select({
				total: count(),
			})
			.from(patientsTable)
			.where(eq(patientsTable.clinicId, session.user.clinic.id)),
		db
			.select({
				total: count(),
			})
			.from(doctorsTable)
			.where(eq(doctorsTable.clinicId, session.user.clinic.id)),
		db
			.select({
				id: doctorsTable.id,
				name: doctorsTable.name,
				avatarImageUrl: doctorsTable.avatarImageUrl,
				specialty: doctorsTable.specialty,
				appointments: count(appointmentsTable.id),
			})
			.from(doctorsTable)
			.leftJoin(
				appointmentsTable,
				and(
					eq(appointmentsTable.doctorId, doctorsTable.id),
					gte(appointmentsTable.date, fromDate),
					lte(appointmentsTable.date, toDate),
				),
			)
			.where(eq(doctorsTable.clinicId, session.user.clinic.id))
			.groupBy(doctorsTable.id)
			.orderBy(desc(count(appointmentsTable.id)))
			.limit(10),
		db
			.select({
				specialty: doctorsTable.specialty,
				appointments: count(appointmentsTable.id),
			})
			.from(appointmentsTable)
			.innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
			.where(
				and(
					eq(appointmentsTable.clinicId, session.user.clinic.id),
					gte(appointmentsTable.date, fromDate),
					lte(appointmentsTable.date, toDate),
				),
			)
			.groupBy(doctorsTable.specialty)
			.orderBy(desc(count(appointmentsTable.id))),
		db.query.appointmentsTable.findMany({
			where: and(
				eq(appointmentsTable.clinicId, session.user.clinic.id),
				gte(appointmentsTable.date, startOfToday),
				lte(appointmentsTable.date, endOfToday),
			),
			with: {
				patient: true,
				doctor: true,
			},
		}),
		db
			.select({
				date: appointmentLocalDate().as("date"),
				appointments: count(appointmentsTable.id),
				revenue:
					sql<number>`COALESCE(SUM(${appointmentsTable.appointmentInCents}), 0)`.as(
						"revenue",
					),
			})
			.from(appointmentsTable)
			.where(
				and(
					eq(appointmentsTable.clinicId, session.user.clinic.id),
					gte(appointmentsTable.date, chartStartDate),
					lte(appointmentsTable.date, chartEndDate),
				),
			)
			.groupBy(appointmentLocalDate())
			.orderBy(appointmentLocalDate()),
	]);
	return {
		totalRevenue,
		totalAppointments,
		totalPatients,
		totalDoctors,
		topDoctors,
		topSpecialties,
		todayAppointments,
		dailyAppointmentsData,
	};
};