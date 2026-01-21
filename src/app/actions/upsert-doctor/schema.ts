import z from "zod"

export const upsertDoctorSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().trim().min(1,
		{ message: "O nome é obrigatório" }),
	specialty: z.string().trim().min(1,
		{ message: "A especialidade é obrigatória" }),
	appointmentPriceInCents: z.number().min(1,
		{ message: "O preço da consulta é obrigatório" }),
	availableFromWeekDay: z.number().min(0).max(6),
	availableToWeekDay: z.number().min(0).max(6),
	availableFromTime: z.string().min(1,
		{ message: "A hora de inicio é obrigatória" }),
	availableToTime: z.string().min(1,
		{ message: "A hora de término é obrigatória" })
}).refine((data) => {
	if (data.availableFromTime < data.availableToTime) {
		return true
	}
}, {
	message: "O horário de inicio não pode ser maior que o horário de término",
	path: ["availableToTime"]
})

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>