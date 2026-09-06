import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { LoaderIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect("/authentication");
	}

	if (!session.user.clinic) {
		redirect("/clinic-form");
	}

	if (session.user) {
		redirect("/dashboard");
	}

	return (
		<main className="flex justify-center items-center h-screen">
			<Card>
				<div className="flex flex-col text-center justify-center items-center p-8 space-y-2">
					<LoaderIcon className="animate-spin fill-amber-300" />
					<PageTitle>Redirecionando...</PageTitle>
					<p>Estamos direcionando você para a tela de dashboard.<br />Se não for redicionado automaticamente
						{" "}<a href="/dashboard">Clique aqui.</a>
					</p>
				</div>
			</Card>
		</main>
	);
}
