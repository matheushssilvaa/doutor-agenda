import { eq } from "drizzle-orm"
import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
	PageActions,
	PageContainer,
	PageContent,
	PageDescription,
	PageHeader,
	PageHeaderContent,
	PageTitle
} from "@/components/ui/page-container"
import { db } from "@/db"
import { patientsTable } from "@/db/schema"
import { auth } from "@/lib/auth"

import AddPatientButton from "./_components/Add-patient-button"
import { DataTable } from "./_components/Patient-data-table"

export const metadata: Metadata = {
	title: "Doutor Ajuda | Pacientes",
	description: 'Página de pacientes Doutor Ajuda',
}

const PatientPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})
	if (!session?.user) {
		redirect("/authentication")
	}
	if (!session.user.clinic) {
		redirect("/clinic-form")
	}
	const patients = await db.query.patientsTable.findMany({
		where: eq(patientsTable.clinicId, session.user.clinic.id)
	})

	return (
		<>
			<PageContainer>
				<PageHeader>
					<PageHeaderContent>
						<PageTitle>Pacientes</PageTitle>
						<PageDescription>Gerencie os pacientes de sua clínica</PageDescription>
					</PageHeaderContent>
					<PageActions>
						<AddPatientButton />
					</PageActions>
				</PageHeader>
				<PageContent>
					<DataTable data={patients} patients={patients} />
				</PageContent>
			</PageContainer>
		</>
	)
}

export default PatientPage