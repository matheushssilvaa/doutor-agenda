"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { clinicsTable, usersToClinicsTable } from "@/db/schema"
import { createRandom, seedClinic } from "@/db/seed-clinic"
import { auth } from "@/lib/auth"

export const createClinic = async (name: string) => {
    // verificar se o usuário esta logado
    const session = await auth.api.getSession({
        headers: await headers()
    })  

    if (!session?.user) {
        throw new Error("Unauthorized")
    }

	// Cada usuário possui uma única clínica (evita criar várias clínicas com dados de demonstração).
	if (session.user.clinic) {
		redirect("/dashboard")
	}

    const [clinic] = await db.insert(clinicsTable).values({ name }).returning()

	await db.insert(usersToClinicsTable).values({
		userId: session.user.id,
		clinicId: clinic.id
	})

	// Popula a clínica nova com dados de demonstração (médicos, pacientes e agendamentos).
	// Defina SEED_NEW_CLINICS=false no .env para desativar.
	if (process.env.SEED_NEW_CLINICS !== "false") {
		try {
			await seedClinic(clinic, createRandom(Date.now()))
		} catch (e) {
			console.error("Falha ao popular a clínica com dados de demonstração:", e)
		}
	}

	redirect("/dashboard")
}