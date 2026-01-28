"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/app/actions/upsert-appointment";
import { getAvailableTimes } from "@/app/actions/get-available-times";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";

const formSchema = z.object({
	patientId: z.string().min(1, {
		message: "Paciente é obrigatório.",
	}),
	doctorId: z.string().min(1, {
		message: "Médico é obrigatório.",
	}),
	appointmentPriceInCents: z.number().min(1, {
		message: "Valor da consulta é obrigatório.",
	}),
	date: z.date({
		message: "Data é obrigatória.",
	}),
	time: z.string().min(1, {
		message: "Horário é obrigatório.",
	}),
});

interface AddAppointmentFormProps {
	isOpen?: boolean;
	patients: (typeof patientsTable.$inferSelect)[];
	doctors: (typeof doctorsTable.$inferSelect)[];
	onSuccess?: () => void;
}

const AddAppointmentForm = ({
	patients,
	doctors,
	onSuccess,
	isOpen,
}: AddAppointmentFormProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		shouldUnregister: true,
		resolver: zodResolver(formSchema),
		defaultValues: {
			patientId: "",
			doctorId: "",
			appointmentPriceInCents: 0,
			date: undefined,
			time: "",
		},
	});

	const selectedDoctorId = form.watch("doctorId");
	const selectedPatientId = form.watch("patientId");
	const selectedDate = form.watch("date");

	const { data: availableTimes } = useQuery({
		queryKey: ["available-times", selectedDate, selectedDoctorId],
		queryFn: () =>
			getAvailableTimes({
				date: dayjs(selectedDate).format("YYYY-MM-DD"),
				doctorId: selectedDoctorId,
			}),
		enabled: !!selectedDate && !!selectedDoctorId,
	});

	// Atualizar o preço quando o médico for selecionado
	useEffect(() => {
		if (selectedDoctorId) {
			const selectedDoctor = doctors.find(
				(doctor) => doctor.id === selectedDoctorId,
			);
			if (selectedDoctor) {
				form.setValue(
					"appointmentPriceInCents",
					selectedDoctor.appointmentPriceInCents / 100,
				);
			}
		}
	}, [selectedDoctorId, doctors, form]);

	useEffect(() => {
		if (isOpen) {
			form.reset({
				patientId: "",
				doctorId: "",
				appointmentPriceInCents: 0,
				date: undefined,
				time: "",
			});
		}
	}, [isOpen, form]);

	const createAppointmentAction = useAction(upsertAppointment, {
		onSuccess: () => {
			toast.success("Agendamento criado com sucesso.");
			onSuccess?.();
		},
		onError: () => {
			toast.error("Erro ao criar agendamento.");
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		console.log("📤 Valores do formulário:", values);
		createAppointmentAction.execute({
			...values,
			appointmentPriceInCents: values.appointmentPriceInCents * 100
		});
	};

	const isDateTimeEnabled = selectedPatientId && selectedDoctorId;

	return (
		<DialogContent className="sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>Novo agendamento</DialogTitle>
				<DialogDescription>
					Crie um novo agendamento para sua clínica.
				</DialogDescription>
			</DialogHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="patientId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Paciente</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione um paciente" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{patients.map((patient) => (
											<SelectItem key={patient.id} value={patient.id}>
												{patient.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="doctorId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Médico</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione um médico" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{doctors.map((doctor) => (
											<SelectItem key={doctor.id} value={doctor.id}>
												{doctor.name} - {doctor.specialty}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="appointmentPriceInCents"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Valor da consulta</FormLabel>
								<NumericFormat
									value={field.value}
									onValueChange={(value) => {
										field.onChange(value.floatValue);
									}}
									decimalScale={2}
									fixedDecimalScale
									decimalSeparator=","
									thousandSeparator="."
									prefix="R$ "
									allowNegative={false}
									disabled={!selectedDoctorId}
									customInput={Input}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Data</FormLabel>
								<Input
									type="date"
									value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
									onChange={(e) => {
										const dateValue = e.target.value;
										field.onChange(dateValue ? new Date(dateValue) : undefined);
									}}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="time"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Horário</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={!isDateTimeEnabled || !selectedDate}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione um horário" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availableTimes?.data?.map((time: any) => (
											<SelectItem
												key={time.value}
												value={time.value}
												disabled={!time.available}
											>
												{time.label} {!time.available && "(Indisponível)"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" disabled={createAppointmentAction.isPending}>
							{createAppointmentAction.isPending
								? "Criando..."
								: "Criar agendamento"}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
};

export default AddAppointmentForm;