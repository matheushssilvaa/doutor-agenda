"use client"

import { Calendar1Icon, ClockIcon, DollarSignIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"

import { deleteDoctor } from "@/app/actions/delete-doctor"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { doctorsTable } from "@/db/schema"
import { formatCurrencyInCents } from "@/helpers/currency"

import { getAvailability } from "../helpers/availability"
import UpsertDoctorForm from "./Upserts-doctor-form"

interface DoctorCardProps {
	doctor: typeof doctorsTable.$inferSelect
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
	const [isUpsertDoctorsDialogOpen, setIsUpsertDoctorsDialogOpen] = useState(false)
	const [isDeleteDoctorsDialogOpen, setIsDeleteDoctorsDialogOpen] = useState(false)

	const doctorInitials = doctor.name
		.split(" ")
		.map((name) => name[0])
		.join("")

	const deleteDoctorAction = useAction(deleteDoctor, {
		onSuccess: () => {
			toast.success("Médico deletado com sucesso.")
		},
		onError: () => {
			toast.success("Erro ao deletar o médico.")
		}
	})

	const handleDeleteDoctorClick = () => {
		if (!doctor) {
			return
		}
		deleteDoctorAction.execute({ id: doctor.id })
	}

	const availability = getAvailability(doctor)
	return (
		<Card>
			<CardHeader>
				<div className="flex min-w-0 items-center gap-2">
					<Avatar className="shrink-0">
						<AvatarFallback>{doctorInitials}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<h3 className="truncate text-sm font-medium">{doctor.name}</h3>
						<p className="truncate text-sm text-muted-foreground">{doctor.specialty}</p>
					</div>
				</div>
			</CardHeader>
			<Separator />
			<CardContent className="flex flex-col gap-2">
				<Badge variant="outline" className="max-w-full whitespace-normal">
					<Calendar1Icon className="mr-1" />
					{availability.from.format("dddd")} - {availability.to.format("dddd")}
				</Badge>
				<Badge variant="outline" className="max-w-full whitespace-normal">
					<ClockIcon className="mr-1" />
					{availability.from.format("HH:mm")} as {" "}
					{availability.to.format("HH:mm")}
				</Badge>
				<Badge variant="outline" className="max-w-full whitespace-normal">
					<DollarSignIcon className="mr-1" />
					{formatCurrencyInCents(doctor.appointmentPriceInCents)}
				</Badge>
			</CardContent>
			<Separator />
			<CardFooter className="flex flex-col gap-2">
				<Dialog
					open={isUpsertDoctorsDialogOpen}
					onOpenChange={setIsUpsertDoctorsDialogOpen}>
					<DialogTrigger asChild>
						<Button className="w-full bg-primary/15 text-primary hover:bg-primary/10">
							Ver detalhes
						</Button>
					</DialogTrigger>
					<UpsertDoctorForm doctor={{
						...doctor,
						availableFromTime: availability.from.format("HH:mm:ss"),
						availableToTime: availability.to.format("HH:mm:ss")
					}}
						onSuccess={() => setIsUpsertDoctorsDialogOpen(false)}
					/>
				</Dialog>

				<AlertDialog
					open={isDeleteDoctorsDialogOpen}
					onOpenChange={setIsDeleteDoctorsDialogOpen}>
					<AlertDialogTrigger asChild>
						<Button className="w-full" variant="outline">
							Excluir
						</Button>
					</AlertDialogTrigger >
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Tem certeza que deseja deletar esse médico?</AlertDialogTitle>
							<AlertDialogDescription>
								Essa ação não pode ser revertida. Isso irá deletar o médico e todas as consultas agendadas.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>
								Cancelar
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteDoctorClick}>
								Deletar
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	)
}

export default DoctorCard