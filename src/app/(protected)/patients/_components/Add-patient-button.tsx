"use client"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import UpsertPatientsForm from "./Upsert-patients-form"
import { useState } from "react"

const AddPatientButton = () => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Adicionar paciente
				</Button>
			</DialogTrigger>
			<UpsertPatientsForm onSuccess={() => setIsOpen(false)} />
		</Dialog>
	)
}

export default AddPatientButton