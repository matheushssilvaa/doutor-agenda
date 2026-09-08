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
import React from "react"

interface DeleteDialogProps {
	alertTriger: React.ReactNode
	alertDialogTitle: string
	alertDialogDescription: string
	alertDialogAction: () => void
}

const DeleteDialog = ({
	alertTriger,
	alertDialogTitle,
	alertDialogDescription,
	alertDialogAction
}: DeleteDialogProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				{alertTriger}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
					<AlertDialogDescription>
						{alertDialogDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={alertDialogAction}>
						Deletar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default DeleteDialog