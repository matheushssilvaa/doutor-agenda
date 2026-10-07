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
import { doctorsTable } from "@/db/schema"
import { auth } from "@/lib/auth"

import AddDoctorButton from "./_components/Add-doctor-button"
import ListDoctorCard from "./_components/List-doctor-card"

export const metadata: Metadata = {
	title: "Doutor Ajuda | Médicos",
	description: 'Página de médicos Doutor Ajuda',
}

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