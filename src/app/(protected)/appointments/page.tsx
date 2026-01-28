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
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema"
import AddAppointmentButton from "./_components/Add-appointment-button"
import { columns, DataTable } from "./_components/Appointment-data-table"

const AppointmentPages = async () => {

	const session = await auth.api.getSession({
		headers: await headers()
	})
	if (!session?.user) {
		redirect("/authentication")
	}
	if (!session.user.clinic) {
		redirect("/clinic-form")
	}

	const appointments = await db.query.appointmentsTable.findMany({
		where: eq(appointmentsTable.clinicId, session.user.clinic.id),
		with: {
			patient: true,
			doctor: true
		}
	})

	const patients = await db.query.patientsTable.findMany({
		where: eq(patientsTable.clinicId, session.user.clinic.id)
	})

	const doctors = await db.query.doctorsTable.findMany({
		where: eq(doctorsTable.clinicId, session.user.clinic.id)
	})

	return (
		<>
			<PageContainer>
				<PageHeader>
					<PageHeaderContent>
						<PageTitle>Agendamentos</PageTitle>
						<PageDescription>Adicione, edite ou exclua agendamentos de seus pacientes</PageDescription>
					</PageHeaderContent>
					<PageActions>
						<AddAppointmentButton
							patients={patients}
							doctors={doctors} />
					</PageActions>
				</PageHeader>
				<PageContent>
					<DataTable
						columns={columns}
						data={appointments}
					/>
				</PageContent>
			</PageContainer>
		</>
	)
}

export default AppointmentPages