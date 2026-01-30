import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { usersToClinicsTable } from "@/db/schema"
import {
	PageActions,
	PageContainer,
	PageContent,
	PageDescription,
	PageHeader,
	PageHeaderContent,
	PageTitle
} from "@/components/ui/page-container"
import { DatePicker } from "./_components/Date-picker"

const DashboardPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})
	if (!session?.user) {
		redirect("/authentication")
	}

	// recuperar clinicas do usuário
	const clinic = await db.query.usersToClinicsTable.findMany({
		where: eq(usersToClinicsTable.userId, session.user.id)
	})

	if (clinic.length == 0) {
		redirect("/clinic-form")
	}

	return (
		<>
			<PageContainer>
				<PageHeader>
					<PageHeaderContent>
						<PageTitle>Dashboard</PageTitle>
						<PageDescription>Resumo geral dos últimos dias de sua clínica</PageDescription>
					</PageHeaderContent>
					<PageActions>
						<DatePicker />
					</PageActions>
				</PageHeader>
				<PageContent>
					<h1></h1>
				</PageContent>
			</PageContainer>
		</>
	)
}

export default DashboardPage