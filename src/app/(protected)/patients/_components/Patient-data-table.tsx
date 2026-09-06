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
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";

type Patient = typeof patientsTable.$inferSelect;

export const columns: ColumnDef<Patient>[] = [
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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState({})
	const [search, setSearch] = useState('')

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

	return (
		<>
			<div className="flex justify-between items-center gap-2 mb-4 w-full">
				<div>
					{table.getSelectedRowModel().rows.length == 0 && (
						<p className="text-sm text-muted-foreground">Nenhum agendamento selecionado</p>
					)}
					{table.getSelectedRowModel().rows.length > 0 && (
						<p className="text-sm text-muted-foreground">{table.getSelectedRowModel().rows.length}{" "} Selecionado(s)</p>
					)}
				</div>
				<div className="flex gap-2">
					{table.getSelectedRowModel().rows.length > 0 && (
						<>
							<Button variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/15">
								<Trash2Icon />
							</Button>
						</>
					)}
					<div className="w-full">
						<Input placeholder="Pesquise Pacientes"
							value={search ?? ""}
							onChange={(e) => setSearch(e.target.value)}
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