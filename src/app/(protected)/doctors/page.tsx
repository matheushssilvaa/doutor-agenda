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
import AddDoctorButton from "./_components/Add-doctor-button"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { doctorsTable } from "@/db/schema"
import ListDoctorCard from "./_components/List-doctor-card"

const DoctorPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})
	if (!session?.user) {
		redirect("/authentication")
	}
	if (!session.user.clinic) {
		redirect("/clinic-form")
	}

	const doctors = await db.query.doctorsTable.findMany({
		where: eq(doctorsTable.clinicId, session?.user?.clinic?.id)
	})

	return (
		<>
			<PageContainer>
				<PageHeader>
					<PageHeaderContent>
						<PageTitle>Médicos</PageTitle>
						<PageDescription>Gerencie os médicos de sua clínica</PageDescription>
					</PageHeaderContent>
					<PageActions>
						<AddDoctorButton />
					</PageActions>
				</PageHeader>
				<PageContent>
					<ListDoctorCard doctors={doctors} />
				</PageContent>
			</PageContainer>
		</>
	)
}

export default DoctorPage