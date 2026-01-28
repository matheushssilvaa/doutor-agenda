import { deleteAppointments } from "@/app/actions/delete-appointment";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { appointmentsTable } from "@/db/schema";
import { Trash2, Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ActionsTableAppointmentProps {
	appointments: typeof appointmentsTable.$inferSelect & {
		patient: {
			id: string,
			name: string,
			phoneNumber: string,
			sex: 'male' | 'female'
		},
		doctor: {
			id: string,
			name: string,
			specialty: string
		}
	};
}

const ActionsTableAppointment = (
	{ appointments }: ActionsTableAppointmentProps) => {

	const deleteAppointmentAction = useAction(deleteAppointments, {
		onSuccess: () => {
			toast.success("Agendamento deletado com sucesso.")
		},
		onError: () => {
			toast.success("Erro ao deletar o agendamento.")
		}
	})

	const handleDeletePatientClick = () => {
		if (!appointments) {
			return
		}

		deleteAppointmentAction.execute({ id: appointments.id })
	}

	return (
		<div>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive">
						<Trash2 />
					</Button>
				</AlertDialogTrigger>

				<AlertDialogContent>
					<AlertDialogTitle>Deletar agendamento de {appointments.patient.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						<strong>Atenção: </strong>essa ação não poderá ser revertida, caso necessário, precisará ser agendado uma nova consulta.
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeletePatientClick}>
							<Trash2Icon />
							Deletar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

export default ActionsTableAppointment