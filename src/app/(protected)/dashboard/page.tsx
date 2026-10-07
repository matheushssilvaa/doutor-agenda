import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	PageActions,
	PageContainer,
	PageContent,
	PageDescription,
	PageHeader,
	PageHeaderContent,
	PageTitle,
} from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { DataTable } from "../appointments/_components/Appointment-data-table";
import AppointmentsChart from "./_components/Appointments-chart";
import { DatePicker } from "./_components/Data-picker";
import StatsCards from "./_components/Stats-cards";
import TopDoctors from "./_components/Top-doctor";
import TopSpecialties from "./_components/Top-specialities";
import { Metadata } from "next";

interface DashboardPageProps {
	searchParams: Promise<{
		from: string;
		to: string;
	}>;
}

export const metadata: Metadata = {
	title: "Doutor Ajuda | Dashboard",
	description: 'Página de Dashboard Doutor Ajuda',
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		redirect("/authentication");
	}
	if (!session.user.clinic) {
		redirect("/clinic-form");
	}
	const { from, to } = await searchParams;
	if (!from || !to) {
		redirect(
			`/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
		);
	}
	const {
		totalRevenue,
		totalAppointments,
		totalPatients,
		totalDoctors,
		topDoctors,
		topSpecialties,
		todayAppointments,
		dailyAppointmentsData,
	} = await getDashboard({
		from,
		to,
		session: {
			user: {
				clinic: {
					id: session.user.clinic.id,
				},
			},
		},
	});

	// Necessários para os selects do formulário de edição de agendamento.
	const [patients, doctors] = await Promise.all([
		db.query.patientsTable.findMany({
			where: eq(patientsTable.clinicId, session.user.clinic.id),
		}),
		db.query.doctorsTable.findMany({
			where: eq(doctorsTable.clinicId, session.user.clinic.id),
		}),
	]);

	return (
		<PageContainer>
			<PageHeader>
				<PageHeaderContent>
					<PageTitle>Dashboard</PageTitle>
					<PageDescription>
						Tenha uma visão geral da sua clínica.
					</PageDescription>
				</PageHeaderContent>
				<PageActions>
					<DatePicker />
				</PageActions>
			</PageHeader>
			<PageContent>
				<StatsCards
					totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
					totalAppointments={totalAppointments.total}
					totalPatients={totalPatients.total}
					totalDoctors={totalDoctors.total}
				/>
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)]">
					<AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
					<TopDoctors doctors={topDoctors} />
				</div>
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)]">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<Calendar className="text-muted-foreground" />
								<CardTitle className="text-base">
									Agendamentos de hoje
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<DataTable
								data={todayAppointments}
								patients={patients}
								doctors={doctors}
							/>
						</CardContent>
					</Card>
					<TopSpecialties topSpecialties={topSpecialties} />
				</div>
			</PageContent>
		</PageContainer>
	);
};

export default DashboardPage;