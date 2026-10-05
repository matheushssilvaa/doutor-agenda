"use client"

import { SearchX } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { doctorsTable } from "@/db/schema"

import EmptyStateData from "../../_components/Empt-state-data"
import AddDoctorButton from "./Add-doctor-button"
import DoctorCard from "./Doctor-card"

type Doctors = typeof doctorsTable.$inferSelect

interface ListDoctorCardProps {
	doctors: Doctors[]
}

const ListDoctorCard = ({ doctors }: ListDoctorCardProps) => {
	const [search, setSearch] = useState("")

	const filteredDoctors = doctors.filter((doctor) =>
		doctor.name.toLowerCase().includes(search.toLowerCase())
	)

	if (doctors.length === 0) {
		return (
			<EmptyStateData
				title="Nenhum médico cadastrado"
				description="Adicione o primeiro médico da sua clínica clicando no botão abaixo"
				action="Adicionar médico"
				actionComponent={<AddDoctorButton />}
			/>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-end w-full">
				<div className="w-full sm:w-[320px] md:w-[380px] lg:w-[420px]">
					<Input
						placeholder="Pesquisar Médicos"
						className="w-full"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>
			{filteredDoctors.length === 0 ? (
				<EmptyStateData
					title="Nenhum médico encontrado"
					description={`Não encontramos médicos para "${search}". Verifique o nome ou limpe a pesquisa.`}
					action="Limpar pesquisa"
					actionComponent={
						<Button variant="secondary" onClick={() => setSearch("")}>
							<SearchX />
							Limpar pesquisa
						</Button>
					}
				/>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 md:gap-6">
					{filteredDoctors.map(doctor =>
						<DoctorCard key={doctor.id} doctor={doctor}
						/>)}
				</div>
			)}
		</div>
	)
}

export default ListDoctorCard