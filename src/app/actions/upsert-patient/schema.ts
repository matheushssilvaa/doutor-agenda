import z from "zod"

export const upsertPatientSchema = z.object({
	id: z.string().uuid().optional(),
	clinicId: z.string().uuid().optional(),
	name: z.string().trim().min(1,
		{ message: "O nome é obrigatório" }),
	email: z.string().email(
		{ message: "O email deve ser válido" }
	).trim().min(1),
	phoneNumber: z.string().min(1,
		{ message: "O Telefone é obrigatório" }),
	sex: z.enum(["male", "female"]),
})

export type upsertPatientSchema = z.infer<typeof upsertPatientSchema>