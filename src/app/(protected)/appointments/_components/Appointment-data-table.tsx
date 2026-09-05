"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
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
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import ActionsTableAppointment from "./Actions-table-appointment";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon } from "lucide-react";

type Appointment = typeof appointmentsTable.$inferSelect & {
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

interface AppointmentsColumnsOptions {
	patients: (typeof patientsTable.$inferSelect)[]
	doctors: (typeof doctorsTable.$inferSelect)[]
}

const getAppointmentsColumns = ({
	patients,
	doctors
}: AppointmentsColumnsOptions): ColumnDef<Appointment>[] => [
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
			accessorKey: "patientId",
			header: "Paciente",
			cell: (params) => {
				const appointment = params.row.original
				return `${appointment.patient.name}`
			}
		},
		{
			accessorKey: "doctorId",
			header: "Médico",
			cell: ({ row }) => {
				const appointment = row.original
				return `${appointment.doctor.name}`
			}
		},
		{
			accessorKey: "date",
			header: "Data",
			cell: ({ row }) => {
				const date = row.original.date
				return date ? new Date(date).toLocaleDateString('pt-BR') : '-'
			}
		},
		{
			accessorKey: "appointmentPriceInCents",
			header: "Preço",
			cell: (params) => {
				const appointment = params.row.original
				const price = appointment.appointmentInCents / 100
				return new Intl.NumberFormat('pt-br', {
					style: "currency",
					currency: "brl",
				}).format(price)
			}
		},
		{
			accessorKey: "createdAt",
			header: "Data de criação",
			cell: ({ row }) => {
				const date = row.original.createdAt
				return date ? new Date(date).toLocaleDateString('pt-BR') : '-'
			}
		},
		{
			accessorKey: "actions",
			header: "Ações",
			cell: (row) => {
				return (
					<ActionsTableAppointment
						appointment={row.row.original}
						patients={patients}
						doctors={doctors}
					/>
				)
			}
		},
	]

interface DataTableProps extends AppointmentsColumnsOptions {
	data: Appointment[]
}

export function DataTable({
	data,
	patients,
	doctors
}: DataTableProps) {
	const [rowSelection, setRowSelection] = useState({})

	const columns = useMemo(
		() => getAppointmentsColumns({ patients, doctors }),
		[patients, doctors]
	)

	const table = useReactTable({
		data,
		columns,
		state: {
			rowSelection
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	})

	return (
		<>
			{table.getSelectedRowModel().rows.length > 0 && (
				<div className="flex justify-end items-center gap-2 mb-4">
					<Button variant="secondary">
						<Trash2Icon />
						Excluir selecionados
					</Button>

					<Button variant="secondary">
						<Edit2Icon />
						Alterar data ou horário
					</Button>
				</div>
			)}
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