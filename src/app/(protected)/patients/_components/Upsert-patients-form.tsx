import { zodResolver } from "@hookform/resolvers/zod"
import {
	DialogContent,
	DialogDescription,
	DialogTitle
} from "@/components/ui/dialog"
import { z } from "zod"
import { useForm } from "react-hook-form"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
import { SelectItem } from "@/components/ui/select"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { patientsTable } from "@/db/schema"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { TrashIcon } from "lucide-react"
import { upsertPatient } from "@/app/actions/upsert-patient"
import { deletePatient } from "@/app/actions/delete-patient"

const formSchema = z.object({
	id: z.string().uuid().optional(),
	clinicId: z.string().uuid().optional(),
	name: z.string().trim().min(1, { message: "O nome é obrigatório" }),
	email: z.string().email({ message: "Insira um email válido" }).trim().min(1),
	phoneNumber: z.string().min(1, { message: "O Telefone é obrigatório" }),
	sex: z.enum(["male", "female"], { message: "Selecione um gênero válido" })
})

interface upsertPatientsProps {
	patient?: typeof patientsTable.$inferSelect,
	onSuccess?: () => void
}

const UpsertPatientsForm = ({ onSuccess, patient }: upsertPatientsProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		shouldUnregister: true,
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: patient?.name ?? "",
			email: patient?.email ?? "",
			phoneNumber: patient?.phoneNumber ?? "",
			sex: patient?.sex
		}
	})

	const upsertPatientAction = useAction(upsertPatient, {
		onSuccess: () => {
			toast.success(patient ? "Paciente atualizado com sucesso!" : "Paciente adicionado com sucesso!")
			onSuccess?.()
		},
		onError: ({ error }) => {
			let errorMessage = ""

			if (typeof error.serverError === 'string') {
				errorMessage = error.serverError
			} else if (error.serverError && typeof error.serverError === 'object') {
				errorMessage = error.serverError.message || JSON.stringify(error.serverError)
			}

			if (!errorMessage && error.fetchError) {
				errorMessage = error.fetchError
			}

			console.log("Mensagem extraída:", errorMessage)

			if (errorMessage) {
				toast.error(errorMessage)
			} else {
				toast.error("Ocorreu um erro. Tente novamente.")
			}
		}
	})

	const deletePatienceAction = useAction(deletePatient, {
		onSuccess: () => {
			toast.success("Paciete deletado com sucesso.")
			onSuccess?.()
		},
		onError: () => {
			toast.success("Erro ao deletar o paciente.")
		}
	})

	const handleDeletePatientClick = () => {
		if (!patient) {
			return
		}
		deletePatienceAction.execute({ id: patient.id })
	}

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		upsertPatientAction.execute({
			...values,
			clinicId: patient?.clinicId,
		})
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{patient ? patient.name : "Adicionar paciente"}</DialogTitle>
				<DialogDescription>Insira os dados do paciente abaixo para criar um novo paciente.</DialogDescription>
			</DialogHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Nome
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)} />

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Email
								</FormLabel>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)} />

					<FormField
						control={form.control}
						name="phoneNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Telefone
								</FormLabel>
								<FormControl>
									<Input type="tel" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="sex"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Gênero
								</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione um gênero" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="male">Masculino</SelectItem>
										<SelectItem value="female">Feminino</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormMessage />

					<DialogFooter>
						{
							patient && <AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive">
										<TrashIcon />
										Deletar paciente
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Tem certeza que deseja deletar esse paciente?</AlertDialogTitle>
										<AlertDialogDescription>
											Essa ação não pode ser revertida. Isso irá deletar o paciente e todas as consultas agendadas para ele.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDeletePatientClick}>
											Deletar
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						}
						<Button type="submit" disabled={upsertPatientAction.isPending}>
							{
								upsertPatientAction.isPending ? "Salvando..."
									: patient ? "Salvar" : "Adicionar"
							}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	)
}

export default UpsertPatientsForm