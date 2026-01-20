"use client"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import UpsertDoctorForm from "./Upserts-doctor-form"

const AddDoctorButton = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Adicionar médico
				</Button>
			</DialogTrigger>
			<UpsertDoctorForm />
		</Dialog>
	)
}

export default AddDoctorButton