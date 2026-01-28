"use client"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import UpsertAppointmentsForm from "./Upsert-appointments-form"
import { useState } from "react"
import { doctorsTable, patientsTable } from "@/db/schema"

interface AddAppointmentProps {
	patients: (typeof patientsTable.$inferSelect)[],
	doctors: (typeof doctorsTable.$inferSelect)[]
}

const AddAppointmentButton = ({ patients, doctors }: AddAppointmentProps) => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Novo agendamento
				</Button>
			</DialogTrigger>
			<UpsertAppointmentsForm
				isOpen={isOpen}
				onSuccess={() => setIsOpen(false)}
				patients={patients}
				doctors={doctors} />
		</Dialog>
	)
}

export default AddAppointmentButton