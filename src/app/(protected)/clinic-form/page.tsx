import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader
} from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import ClinicForm from "./_components/form"

const ClinicFormPage = () => {
	return (
		<div>
			<Dialog open>
				<form>
					<DialogContent >
						<DialogHeader>
							<DialogTitle className="font-bold">Adicionar clínica</DialogTitle>
							<DialogDescription>
								Adicione os dados de sua clínica abaixo para continuar.
							</DialogDescription>
						</DialogHeader>
						<ClinicForm />
					</DialogContent>
				</form>
			</Dialog>
		</div>
	)
}

export default ClinicFormPage