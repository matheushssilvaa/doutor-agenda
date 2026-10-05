import "dotenv/config";

import { inArray } from "drizzle-orm";

import { db } from "./index";
import { appointmentsTable, doctorsTable, patientsTable } from "./schema";
import { createRandom, seedClinic } from "./seed-clinic";

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
