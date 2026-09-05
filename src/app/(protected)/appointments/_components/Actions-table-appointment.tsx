"use client"

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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { Edit2Icon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import UpsertAppointmentForm from "./Upsert-appointments-form";

interface ActionsTableAppointmentProps {
	appointment: typeof appointmentsTable.$inferSelect & {
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
	patients: (typeof patientsTable.$inferSelect)[];
	doctors: (typeof doctorsTable.$inferSelect)[];
}

const ActionsTableAppointment = (
	{ appointment, patients, doctors }: ActionsTableAppointmentProps) => {

	const [isUpsertAppointmentDialogOpen, setIsUpsertAppointmentDialogOpen] =
		useState(false)

	const deleteAppointmentAction = useAction(deleteAppointments, {
		onSuccess: () => {
			toast.success("Agendamento deletado com sucesso.")
		},
		onError: () => {
			toast.error("Erro ao deletar o agendamento.")
		}
	})

	const handleDeleteAppointmentClick = () => {
		if (!appointment) {
			return
		}

		deleteAppointmentAction.execute({ id: appointment.id })
	}

	return (
		<div>
			<Dialog
				open={isUpsertAppointmentDialogOpen}
				onOpenChange={setIsUpsertAppointmentDialogOpen}
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
							Deletar agendamento de{" "}
							{appointment.patient.name}?
						</AlertDialogTitle>

						<AlertDialogDescription>
							<strong>Atenção: </strong>
							essa ação não poderá ser revertida. Caso
							necessário, será preciso agendar uma nova consulta.
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

				<UpsertAppointmentForm
					isOpen={isUpsertAppointmentDialogOpen}
					appointment={appointment}
					patients={patients}
					doctors={doctors}
					onSuccess={() => setIsUpsertAppointmentDialogOpen(false)}
				/>
			</Dialog>
		</div>
	)
}

export default ActionsTableAppointment
