import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Edit2Icon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import UpsertPatientsForm from "./Upsert-patients-form"
import { patientsTable } from "@/db/schema"
import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { deleteAppointments } from "@/app/actions/delete-appointment"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

type Patient = typeof patientsTable.$inferSelect;

interface DialogActionTableProps {
	patient: Patient
}

const DialogActionsTable = ({ patient }: DialogActionTableProps) => {

	const deleteAppointmentAction = useAction(deleteAppointments, {
		onSuccess: () => {
			toast.success("Agendamento deletado com sucesso.")
		},
		onError: () => {
			toast.error("Erro ao deletar o agendamento.")
		}
	})

	const handleDeleteAppointmentClick = () => {
		if (!patient) {
			return
		}

		deleteAppointmentAction.execute({ id: patient.id })
	}

	const [isUpsertPatientsDialogOpen, setIsUpsertDoctorsDialogOpen] = useState(false)

	return (
		<Dialog
			open={isUpsertPatientsDialogOpen}
			onOpenChange={setIsUpsertDoctorsDialogOpen}
		>
			<AlertDialog>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
						>
							<MoreHorizontalIcon />
							<span className="sr-only">
								Abrir menu
							</span>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DialogTrigger asChild>
							<DropdownMenuItem onSelect={(event) => event.preventDefault()}>
								<Edit2Icon />
								Editar
							</DropdownMenuItem>
						</DialogTrigger>

						<DialogTrigger asChild>
							<DropdownMenuItem onSelect={(event) => event.preventDefault()}>
								<EyeIcon />
								Visualizar
							</DropdownMenuItem>
						</DialogTrigger>

						<DropdownMenuSeparator />
						<AlertDialogTrigger asChild>
							<DropdownMenuItem variant="destructive">
								<Trash2Icon />
								Deletar
							</DropdownMenuItem>
						</AlertDialogTrigger>
					</DropdownMenuContent>
				</DropdownMenu>

				<AlertDialogContent>
					<AlertDialogTitle>
						Deletar paciente{" "}
						{patient.name}?
					</AlertDialogTitle>

					<AlertDialogDescription>
						<strong>Atenção: </strong>
						essa ação não poderá ser revertida. Caso
						necessário, será preciso cadastrar os dados do paciente novamente.
					</AlertDialogDescription>

					<AlertDialogFooter>
						<AlertDialogCancel>
							Cancelar
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={handleDeleteAppointmentClick}
							disabled={deleteAppointmentAction.status === "executing"}
						>
							<Trash2Icon />
							{deleteAppointmentAction.status === "executing"
								? "Deletando..."
								: "Deletar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<UpsertPatientsForm
				patient={patient}
				onSuccess={() => setIsUpsertDoctorsDialogOpen(false)}
			/>
		</Dialog>
	)
}

export default DialogActionsTable
