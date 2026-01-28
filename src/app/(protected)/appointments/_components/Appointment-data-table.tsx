"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable
} from "@tanstack/react-table"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { appointmentsTable } from "@/db/schema";
import ActionsTableAppointment from "./Actions-table-appointment";

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

export const columns: ColumnDef<Appointment>[] = [
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
				<ActionsTableAppointment appointments={row.row.original} />
			)
		}
	},
]

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export function DataTable<TData, TValue>({
	columns,
	data
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
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
			</Table>
		</div>
	)
}