"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable
} from "@tanstack/react-table"
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import DialogActionsTable from "./Dialog-actions-table";
import { patientsTable } from "@/db/schema";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteManyPatients } from "@/app/actions/delete-many-patients";
import DeleteDialog from "../../_components/delete-dialog";

type Patient = typeof patientsTable.$inferSelect;

interface AppointmentsColumnsOptions {
	patients: (typeof patientsTable.$inferSelect)[]
}

const getPatientsColumns = ({
	patients
}: AppointmentsColumnsOptions): ColumnDef<Patient>[] => [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(!!value)
					}
					aria-label="Selecionar todos"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Selecionar linha"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "patientId",
			accessorKey: "id",
			header: "Identificador"
		},
		{
			accessorKey: "name",
			header: "Nome"
		},
		{
			accessorKey: "email",
			header: "Email"
		},
		{
			accessorKey: "phoneNumber",
			header: "Telefone"
		},
		{
			accessorKey: "action",
			header: "Ações",
			cell: ({ row }) => <DialogActionsTable patient={row.original as Patient} />
		},
	]

interface DataTableProps extends AppointmentsColumnsOptions {
	data: Patient[]
}

export function DataTable({
	data,
	patients
}: DataTableProps) {
	const [rowSelection, setRowSelection] = useState({})
	const [search, setSearch] = useState('')

	const columns = useMemo(
		() => getPatientsColumns({ patients }),
		[patients]
	)

	const table = useReactTable({
		data,
		columns,
		state: {
			rowSelection,
			globalFilter: search
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		getFilteredRowModel: getFilteredRowModel(),
		getColumnCanGlobalFilter: () => true,
		getCoreRowModel: getCoreRowModel(),
		onGlobalFilterChange: setSearch,
		getPaginationRowModel: getPaginationRowModel()
	})

	const selectedPatients = table.getSelectedRowModel().rows.map(
		(row) => row.original
	)

	const selectedPatientsIds = selectedPatients.map((data) => data.id)

	console.log(selectedPatientsIds)

	const deleteManyAppointmentsAction = useAction(deleteManyPatients, {
		onSuccess: () => {
			toast.success("Pacientes excluídos com sucesso!")
		},
		onError: (e) => {
			console.error(e)
			toast.error("Ocorreu um erro ao excluir os pacientes selecionados, tente novamente.")
		}
	})

	const handleDeletePatientsClick = () => {
		if (!patientsTable) {
			return
		}
		deleteManyAppointmentsAction.execute(selectedPatientsIds)
	}

	return (
		<>
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 w-full">
				<div>
					{table.getSelectedRowModel().rows.length === 0 && (
						<p className="text-sm text-muted-foreground">
							Nenhum agendamento selecionado
						</p>
					)}

					{table.getSelectedRowModel().rows.length > 0 && (
						<p className="text-sm text-muted-foreground">
							{table.getSelectedRowModel().rows.length} Selecionado(s)
						</p>
					)}
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="w-[40px] shrink-0">
						{table.getSelectedRowModel().rows.length > 0 && (
							<DeleteDialog
								alertTriger={
									<Button
										variant="destructive"
										className="bg-destructive/10 text-destructive hover:bg-destructive/15"
									>
										<Trash2Icon />
									</Button>
								}
								alertDialogTitle="Tem certeza que deseja deletar os pacientes selecionados?"
								alertDialogDescription="Essa ação não pode ser revertida. Será necessário cadastrar um novo paciente se necessário."
								alertDialogAction={handleDeletePatientsClick}
							/>
						)}
					</div>
					<div className="w-full sm:w-[320px] md:w-[380px] lg:w-[420px]">
						<Input
							placeholder="Pesquise Pacientes"
							value={search ?? ""}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full"
						/>
					</div>
				</div>
			</div>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"} >
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Nenhum dado encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={columns.length}>
								<div className="flex items-center justify-end gap-2">
									<Select
										value={`${table.getState().pagination.pageSize}`}
										onValueChange={(value) => {
											table.setPageSize(Number(value))
										}}
									>
										<SelectTrigger className="w-[100px]">
											<SelectValue />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value="10">10</SelectItem>
											<SelectItem value="20">20</SelectItem>
											<SelectItem value="50">50</SelectItem>
											<SelectItem value="100">100</SelectItem>
										</SelectContent>
									</Select>

									<Button
										variant="outline"
										size="sm"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
									>
										Anterior
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
									>
										Próxima
									</Button>
								</div>
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		</>
	)
}