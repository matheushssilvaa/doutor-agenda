import {
	PageActions,
	PageContainer,
	PageContent,
	PageDescription,
	PageHeader,
	PageHeaderContent,
	PageTitle
} from "@/components/ui/page-container"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { patientsTable } from "@/db/schema"
import AddPatientButton from "./_components/Add-patient-button"
import { columns, DataTable } from "./_components/Patient-data-table"

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
					<DataTable columns={columns} data={patients} />
				</PageContent>
			</PageContainer>
		</>
	)
}

export default PatientPage