"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { format, startOfDay } from "date-fns"

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
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_ZONE = "America/Sao_Paulo";

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

type Appointment = typeof appointmentsTable.$inferSelect;

interface UpsertAppointmentFormProps {
	isOpen?: boolean;
	patients: (typeof patientsTable.$inferSelect)[];
	doctors: (typeof doctorsTable.$inferSelect)[];
	appointment?: Appointment;
	onSuccess?: () => void;
}

const getDefaultValues = (appointment?: Appointment) => {
	if (!appointment) {
		return {
			patientId: "",
			doctorId: "",
			appointmentPriceInCents: 0,
			date: undefined,
			time: "",
		};
	}

	const appointmentDate = dayjs(appointment.date).tz(TIME_ZONE);

	return {
		patientId: appointment.patientId,
		doctorId: appointment.doctorId,
		appointmentPriceInCents: appointment.appointmentInCents / 100,
		date: new Date(
			appointmentDate.year(),
			appointmentDate.month(),
			appointmentDate.date(),
		),
		time: appointmentDate.format("HH:mm:ss"),
	};
};

const UpsertAppointmentForm = ({
	patients,
	doctors,
	appointment,
	onSuccess,
	isOpen,
}: UpsertAppointmentFormProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		shouldUnregister: true,
		resolver: zodResolver(formSchema),
		defaultValues: getDefaultValues(appointment),
	});

	const selectedDoctorId = form.watch("doctorId");
	const selectedPatientId = form.watch("patientId");
	const selectedDate = form.watch("date");

	const { data: availableTimes } = useQuery({
		queryKey: [
			"available-times",
			selectedDate,
			selectedDoctorId,
			appointment?.id,
		],
		queryFn: () =>
			getAvailableTimes({
				date: dayjs(selectedDate).format("YYYY-MM-DD"),
				doctorId: selectedDoctorId,
				appointmentId: appointment?.id,
			}),
		enabled: !!selectedDate && !!selectedDoctorId,
	});

	const previousDoctorIdRef = useRef<string | undefined>(appointment?.doctorId);

	// Atualizar o preço quando o médico for trocado pelo usuário
	useEffect(() => {
		if (!selectedDoctorId) {
			return;
		}
		if (previousDoctorIdRef.current === selectedDoctorId) {
			return;
		}
		previousDoctorIdRef.current = selectedDoctorId;

		const selectedDoctor = doctors.find(
			(doctor) => doctor.id === selectedDoctorId,
		);
		if (selectedDoctor) {
			form.setValue(
				"appointmentPriceInCents",
				selectedDoctor.appointmentPriceInCents / 100,
			);
		}
		form.setValue("time", "");
	}, [selectedDoctorId, doctors, form]);

	useEffect(() => {
		if (isOpen) {
			previousDoctorIdRef.current = appointment?.doctorId;
			form.reset(getDefaultValues(appointment));
		}
	}, [isOpen, appointment, form]);

	const upsertAppointmentAction = useAction(upsertAppointment, {
		onSuccess: () => {
			toast.success(
				appointment
					? "Agendamento atualizado com sucesso."
					: "Agendamento criado com sucesso.",
			);
			onSuccess?.();
		},
		onError: () => {
			toast.error(
				appointment
					? "Erro ao atualizar agendamento."
					: "Erro ao criar agendamento.",
			);
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		upsertAppointmentAction.execute({
			...values,
			id: appointment?.id,
			appointmentPriceInCents: values.appointmentPriceInCents * 100
		});
	};

	const isDateAvailable = (date: Date) => {
		if (!selectedDoctorId) return false;
		const selectedDoctor = doctors.find(
			(doctor) => doctor.id === selectedDoctorId,
		);
		if (!selectedDoctor) return false;
		const dayOfWeek = date.getDay();
		return (
			dayOfWeek >= selectedDoctor?.availableFromWeekDay &&
			dayOfWeek <= selectedDoctor?.availableToWeekDay
		);
	};

	const isDateTimeEnabled = selectedPatientId && selectedDoctorId;

	return (
		<DialogContent className="sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>
					{appointment ? "Editar agendamento" : "Novo agendamento"}
				</DialogTitle>
				<DialogDescription>
					{appointment
						? "Altere os dados do agendamento abaixo."
						: "Crie um novo agendamento para sua clínica."}
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
									value={field.value}
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
									value={field.value}
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
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												disabled={!isDateTimeEnabled}
												className={cn(
													"w-full justify-start text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Selecione uma data</span>
												)}
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date < startOfDay(new Date()) || !isDateAvailable(date)
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
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
									value={field.value}
									disabled={!isDateTimeEnabled || !selectedDate}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione um horário" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availableTimes?.data?.map((time) => (
											<SelectItem
												key={time.value}
												value={time.value}
												disabled={!time.available}
											>
												{time.label} {!time.available ? "(Indisponivel)" : ""}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" disabled={upsertAppointmentAction.isPending}>
							{upsertAppointmentAction.isPending
								? "Salvando..."
								: appointment
									? "Salvar"
									: "Criar agendamento"}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
};

export default UpsertAppointmentForm;
