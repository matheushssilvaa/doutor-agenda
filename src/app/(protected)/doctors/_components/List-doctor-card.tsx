"use client"

import { Input } from "@/components/ui/input"
import DoctorCard from "./Doctor-card"
import { doctorsTable } from "@/db/schema"
import { useState } from "react"

type Doctors = typeof doctorsTable.$inferSelect

interface ListDoctorCardProps {
	doctors: Doctors[]
}

const ListDoctorCard = ({ doctors }: ListDoctorCardProps) => {
	const [search, setSearch] = useState("")

	const filteredDoctors = doctors.filter((doctor) =>
		doctor.name.toLowerCase().includes(search.toLowerCase())
	)

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
			<div className="grid grid-cols-3 gap-6">
				{filteredDoctors.map(doctor =>
					<DoctorCard key={doctor.id} doctor={doctor}
					/>)}
			</div>
		</div>
	)
}

export default ListDoctorCard