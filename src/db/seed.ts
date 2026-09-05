import "dotenv/config";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { inArray } from "drizzle-orm";

import { db } from "./index";
import {
	appointmentsTable,
	clinicsTable,
	doctorsTable,
	patientsTable,
} from "./schema";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_ZONE = "America/Sao_Paulo";

const DAYS_BEFORE = 20;
const DAYS_AFTER = 40;
const APPOINTMENTS_TODAY = 5;

const toUtcTime = (localTime: string) =>
	dayjs.tz(`2024-01-01 ${localTime}`, TIME_ZONE).utc().format("HH:mm:ss");

const doctorsSeed = [
	{
		name: "Dra. Helena Marques",
		specialty: "Cardiologia",
		availableFromWeekDay: 1,
		availableToWeekDay: 5,
		availableFromTime: "08:00:00",
		availableToTime: "17:00:00",
		appointmentPriceInCents: 45000,
	},
	{
		name: "Dr. Rafael Nogueira",
		specialty: "Ortopedia e Traumatologia",
		availableFromWeekDay: 1,
		availableToWeekDay: 6,
		availableFromTime: "07:00:00",
		availableToTime: "13:00:00",
		appointmentPriceInCents: 38000,
	},
	{
		name: "Dra. Camila Barros",
		specialty: "Pediatria",
		availableFromWeekDay: 1,
		availableToWeekDay: 5,
		availableFromTime: "09:00:00",
		availableToTime: "18:00:00",
		appointmentPriceInCents: 30000,
	},
	{
		name: "Dr. Eduardo Lima",
		specialty: "Dermatologia",
		availableFromWeekDay: 2,
		availableToWeekDay: 6,
		availableFromTime: "10:00:00",
		availableToTime: "19:00:00",
		appointmentPriceInCents: 42000,
	},
	{
		name: "Dra. Patrícia Salles",
		specialty: "Ginecologia e Obstetrícia",
		availableFromWeekDay: 1,
		availableToWeekDay: 5,
		availableFromTime: "08:30:00",
		availableToTime: "16:30:00",
		appointmentPriceInCents: 40000,
	},
	{
		name: "Dr. Thiago Ferraz",
		specialty: "Neurologia",
		availableFromWeekDay: 1,
		availableToWeekDay: 4,
		availableFromTime: "13:00:00",
		availableToTime: "20:00:00",
		appointmentPriceInCents: 52000,
	},
	{
		name: "Dra. Luana Prado",
		specialty: "Oftalmologia",
		availableFromWeekDay: 2,
		availableToWeekDay: 6,
		availableFromTime: "08:00:00",
		availableToTime: "15:00:00",
		appointmentPriceInCents: 35000,
	},
	{
		name: "Dr. Marcelo Antunes",
		specialty: "Clínica Médica",
		availableFromWeekDay: 1,
		availableToWeekDay: 5,
		availableFromTime: "07:30:00",
		availableToTime: "16:00:00",
		appointmentPriceInCents: 28000,
	},
];

const patientsSeed: { name: string; sex: "male" | "female" }[] = [
	{ name: "Ana Beatriz Rocha", sex: "female" },
	{ name: "Bruno Carvalho", sex: "male" },
	{ name: "Carla Menezes", sex: "female" },
	{ name: "Daniel Figueiredo", sex: "male" },
	{ name: "Eduarda Pinheiro", sex: "female" },
	{ name: "Felipe Andrade", sex: "male" },
	{ name: "Gabriela Souto", sex: "female" },
	{ name: "Henrique Vasques", sex: "male" },
	{ name: "Isabela Moraes", sex: "female" },
	{ name: "João Pedro Tavares", sex: "male" },
	{ name: "Karina Duarte", sex: "female" },
	{ name: "Lucas Ferreira", sex: "male" },
	{ name: "Mariana Coelho", sex: "female" },
	{ name: "Nicolas Ribeiro", sex: "male" },
	{ name: "Olívia Castro", sex: "female" },
	{ name: "Paulo Henrique Braga", sex: "male" },
	{ name: "Renata Aguiar", sex: "female" },
	{ name: "Samuel Vieira", sex: "male" },
	{ name: "Tatiane Lopes", sex: "female" },
	{ name: "Vinícius Correia", sex: "male" },
	{ name: "Yasmin Teixeira", sex: "female" },
	{ name: "Otávio Bittencourt", sex: "male" },
	{ name: "Larissa Fontes", sex: "female" },
	{ name: "Rodrigo Salgado", sex: "male" },
];

const createRandom = (seed: number) => {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const slugify = (value: string) =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ".")
		.replace(/^\.|\.$/g, "");

const buildSlots = (fromTime: string, toTime: string) => {
	const toMinutes = (time: string) => {
		const [hour, minute] = time.split(":").map(Number);
		return hour * 60 + minute;
	};
	const slots: string[] = [];
	for (let m = toMinutes(fromTime); m <= toMinutes(toTime) - 30; m += 30) {
		const hour = Math.floor(m / 60);
		const minute = m % 60;
		slots.push(
			`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
		);
	}
	return slots;
};

const seedClinic = async (
	clinic: typeof clinicsTable.$inferSelect,
	random: () => number,
) => {
	const insertedDoctors = await db
		.insert(doctorsTable)
		.values(
			doctorsSeed.map((doctor) => ({
				clinicId: clinic.id,
				name: doctor.name,
				specialty: doctor.specialty,
				avatarImageUrl: null,
				availableFromWeekDay: doctor.availableFromWeekDay,
				availableToWeekDay: doctor.availableToWeekDay,
				availableFromTime: toUtcTime(doctor.availableFromTime),
				availableToTime: toUtcTime(doctor.availableToTime),
				appointmentPriceInCents: doctor.appointmentPriceInCents,
			})),
		)
		.returning();

	const emailDomain = `${slugify(clinic.name) || "clinica"}.exemplo.com.br`;
	const insertedPatients = await db
		.insert(patientsTable)
		.values(
			patientsSeed.map((patient, index) => ({
				clinicId: clinic.id,
				name: patient.name,
				email: `${slugify(patient.name)}@${emailDomain}`,
				phoneNumber: `(16) 9${String(8000 + index).padStart(4, "0")}-${String(1000 + index * 37).padStart(4, "0")}`,
				sex: patient.sex,
			})),
		)
		.returning();

	const slotsByDoctorId = new Map(
		insertedDoctors.map((doctor, index) => [
			doctor.id,
			{
				slots: buildSlots(
					doctorsSeed[index].availableFromTime,
					doctorsSeed[index].availableToTime,
				),
				fromWeekDay: doctorsSeed[index].availableFromWeekDay,
				toWeekDay: doctorsSeed[index].availableToWeekDay,
			},
		]),
	);

	const appointments: (typeof appointmentsTable.$inferInsert)[] = [];
	const takenSlots = new Set<string>();

	const scheduleOne = (day: dayjs.Dayjs) => {
		const weekDay = day.day();
		const availableDoctors = insertedDoctors.filter((doctor) => {
			const availability = slotsByDoctorId.get(doctor.id)!;
			return (
				weekDay >= availability.fromWeekDay &&
				weekDay <= availability.toWeekDay
			);
		});
		if (availableDoctors.length === 0) {
			return false;
		}

		const doctor =
			availableDoctors[Math.floor(random() * availableDoctors.length)];
		const { slots } = slotsByDoctorId.get(doctor.id)!;
		const slot = slots[Math.floor(random() * slots.length)];

		const key = `${doctor.id}-${day.format("YYYY-MM-DD")}-${slot}`;
		if (takenSlots.has(key)) {
			return false;
		}
		takenSlots.add(key);

		const patient =
			insertedPatients[Math.floor(random() * insertedPatients.length)];

		appointments.push({
			clinicId: clinic.id,
			doctorId: doctor.id,
			patientId: patient.id,
			date: dayjs
				.tz(`${day.format("YYYY-MM-DD")} ${slot}`, TIME_ZONE)
				.toDate(),
			appointmentInCents: doctor.appointmentPriceInCents,
		});
		return true;
	};

	const today = dayjs().startOf("day");
	for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset++) {
		const day = today.add(offset, "day");
		const isWeekend = day.day() === 0 || day.day() === 6;
		const target =
			offset === 0
				? APPOINTMENTS_TODAY
				: isWeekend
					? Math.floor(random() * 3)
					: 2 + Math.floor(random() * 5);
		let created = 0;
		for (let attempt = 0; attempt < target * 4 && created < target; attempt++) {
			if (scheduleOne(day)) {
				created++;
			}
		}
	}

	if (appointments.length > 0) {
		await db.insert(appointmentsTable).values(appointments);
	}

	return {
		doctors: insertedDoctors.length,
		patients: insertedPatients.length,
		appointments: appointments.length,
	};
};

const main = async () => {
	const shouldReset = process.argv.includes("--reset");
	const clinicArg = process.argv
		.find((arg) => arg.startsWith("--clinic="))
		?.split("=")[1];

	const clinics = await db.query.clinicsTable.findMany();
	const targetClinics = clinicArg
		? clinics.filter((clinic) => clinic.id === clinicArg)
		: clinics;

	if (targetClinics.length === 0) {
		throw new Error(
			clinicArg
				? `Nenhuma clínica encontrada com o id ${clinicArg}.`
				: "Nenhuma clínica cadastrada. Crie uma pela aplicação (/clinic-form) antes de rodar o seed.",
		);
	}

	const clinicIds = targetClinics.map((clinic) => clinic.id);

	if (shouldReset) {
		await db
			.delete(appointmentsTable)
			.where(inArray(appointmentsTable.clinicId, clinicIds));
		await db
			.delete(patientsTable)
			.where(inArray(patientsTable.clinicId, clinicIds));
		await db
			.delete(doctorsTable)
			.where(inArray(doctorsTable.clinicId, clinicIds));
		console.log(
			`Médicos, pacientes e agendamentos removidos de ${clinicIds.length} clínica(s).`,
		);
	}

	for (const [index, clinic] of targetClinics.entries()) {
		const result = await seedClinic(clinic, createRandom(2026 + index * 7919));
		console.log(
			`${clinic.name}: ${result.doctors} médicos, ${result.patients} pacientes, ${result.appointments} agendamentos.`,
		);
	}
};

main()
	.then(() => {
		console.log("Seed concluído.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Falha no seed:", error);
		process.exit(1);
	});
