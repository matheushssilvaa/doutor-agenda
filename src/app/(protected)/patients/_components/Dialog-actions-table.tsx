import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Edit2, EyeIcon } from "lucide-react"
import UpsertPatientsForm from "./Upsert-patients-form"
import { patientsTable } from "@/db/schema"
import { useState } from "react"

type Patient = typeof patientsTable.$inferSelect;

interface DialogActionTableProps {
	patient: Patient
}

const DialogActionsTable = ({ patient }: DialogActionTableProps) => {

	const [isUpsertPatientsDialogOpen, setIsUpsertDoctorsDialogOpen] = useState(false)

	return (
		<Dialog
			open={isUpsertPatientsDialogOpen}
			onOpenChange={setIsUpsertDoctorsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" className="mr-2">
					<Edit2 />
				</Button>
			</DialogTrigger>

			<DialogTrigger asChild>
				<Button>
					<EyeIcon />
				</Button>
			</DialogTrigger>

			<UpsertPatientsForm
				patient={patient}
				onSuccess={() => setIsUpsertDoctorsDialogOpen(false)}
			/>
		</Dialog>
	)
}

export default DialogActionsTable