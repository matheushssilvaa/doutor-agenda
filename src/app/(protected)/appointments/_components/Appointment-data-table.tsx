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

type Appointment = typeof appointmentsTable.$inferSelect;

export const columns: ColumnDef<Appointment>[] = [
	{
		accessorKey: "id",
		header: "ID"
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
		accessorKey: "patientId",
		header: "Paciente"
	},
	{
		accessorKey: "doctorId",
		header: "Médico"
	},
	{
		accessorKey: "createdAt",
		header: "Criado em",
		cell: ({ row }) => {
			const date = row.original.createdAt
			return date ? new Date(date).toLocaleDateString('pt-BR') : '-'
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