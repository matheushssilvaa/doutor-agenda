"use client"

import { createClinic } from "@/app/actions/create-clinic"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"   
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const clinicFormSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome da clínica é obrigatório" }),
})

const ClinicForm = () => {
    const form = useForm<z.infer<typeof clinicFormSchema>>({
        resolver: zodResolver(clinicFormSchema),
        defaultValues: {
            name: ""
        },
    })
	const onSubmit = async (data: z.infer<typeof clinicFormSchema>) => {
    try{
		await createClinic(data.name)
		toast.success("Clínica criada com sucesso!")
		form.reset()
	}catch(e) {
		console.error(e)
		if(isRedirectError(e)){
			return
		}
		toast.error("Ocorreu um erro ao criar a clínica. Por favor, atualize a página e tente novamente.")
	}
}
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="Seu nome aqui..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
							{
								form.formState.isSubmitting && (
									<Loader2 className="h-4 w-4 animate-spin" />
								)
							}
							Criar clínica
						</Button>
                    </DialogFooter>
                </form>
            </Form>
        </div>
    )
}

export default ClinicForm