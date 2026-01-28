import z from "zod"

export const upsertAppointmentSchema = z.object({
	id: z.string().optional(),
	date: z.date(),
	patientId: z.string(),
	doctorId: z.string(),
	clinicId: z.string().optional(),
	appointmentPriceInCents: z.number(),
	time: z.string().optional(),
})

export type upsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>