import { headers } from "next/headers"
import Image from "next/image"
import { redirect } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"

import LoginForm from "./components/Login-form"
import SignUpForm from "./components/Sign-up-form"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: "Doutor Ajuda | Entrar",
	description: 'Página de autenticação Doutor Ajuda',
}

const AuthenticationPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})
	if (session?.user) {
		redirect("/dashboard")
	}
	return (
		<div className="flex min-h-screen w-full flex-col items-center gap-8 px-4 pt-[10vh] pb-8 sm:pt-[15vh]" >
			<Image src="/Logo.svg" alt="Dr. Agenda" width={160} height={40} priority />
			<Tabs defaultValue="login" className="w-full max-w-[400px]">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="register">Criar conta</TabsTrigger>
				</TabsList>
				<TabsContent value="login">
					<LoginForm />
				</TabsContent>
				<TabsContent value="register">
					<SignUpForm />
				</TabsContent>
			</Tabs>
		</div >
	)
}

export default AuthenticationPage