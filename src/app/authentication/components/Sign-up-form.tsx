"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const registerSchema = z.object({
	name: z.string().trim().min(3, { message: "Nome é obrigatório" }),
	email: z.email({ message: "Email inválido" }).trim().min(1),
	password: z.string().trim().min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
})

const SignUpForm = () => {

	const router = useRouter()

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: ""
		},
	})

	async function onSubmit(values: z.infer<typeof registerSchema>) {
		await authClient.signUp.email({
			email: values.email,
			password: values.password,
			name: values.name
		}, {
			onSuccess: () => {
				router.push("/dashboard")
			},
			onError: (ctx) => {
				console.log(ctx.error)
				if (ctx.error.code == "USER_ALREADY_EXISTS") {
					toast.error("Email já cadastrado. Faça login ou recupere sua senha abaixo")
				}
			}
		})
	}

	return (
		<Card>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<CardHeader>
						<CardTitle>Criar conta</CardTitle>
						<CardDescription>
							Insira as informações abaixo para criar sua conta
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl>
										<Input placeholder="Seu nome aqui..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="Seu email aqui..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Senha</FormLabel>
									<FormControl>
										<Input placeholder="Crie sua senha..." type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="w-full"
							disabled={form.formState.isSubmitting} >
							{
								form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : ("Criar conta")
							}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	)
}

export default SignUpForm