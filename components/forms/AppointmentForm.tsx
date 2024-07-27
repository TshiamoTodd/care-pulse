"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
} from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { Dispatch, SetStateAction, useState } from "react"
import { getAppointmentSchema, UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { FormFieldType } from "./PatientForm"
import { Doctors } from "@/constants"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions"
import { Appointment } from "@/types/appwrite.types"

const AppointmentForm = ({type, userId, patientId, appointment, setOpen}: {
    type: 'create' | 'cancel' | 'schedule',
    appointment?: Appointment,
    setOpen?: Dispatch<SetStateAction<boolean>>,
    userId: string,
    patientId: string
}) =>  {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const AppointmentFormValidation = getAppointmentSchema(type)

  // 1. Define your form.
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
        primaryPhysician: appointment ? appointment?.primaryPhysician: '',
        schedule: appointment ? new Date(appointment?.schedule): new Date(Date.now()),
        reason: appointment ? appointment.reason : "",
        note: appointment?.note || '',
        cancellationReason:  appointment?.cancellationReason || '',
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true)

    let status

    switch (type) {
        case 'schedule':
            status = 'scheduled'
            break;
        case 'cancel':
            status = 'cancelled'
            break;
        default:
            status = 'pending'
            break;
    }

    try {
        if(type === 'create' && patientId) {
            const appointmentData = {
                userId,
                patient: patientId,
                primaryPhysician: values.primaryPhysician,
                schedule: new Date(values.schedule),
                reason: values.reason!,
                note: values.note,
                status: status as Status,
            }

            const appointment = await createAppointment(appointmentData)

            console.log('Successfully created appointment', appointment)

            if(appointment) {
                form.reset()
                router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
            }
                
        } else {
            const appointmentToUpdate = {
                userId,
                appointmentId: appointment!.$id,
                appointment: {
                    primaryPhysician: values?.primaryPhysician,
                    schedule: new Date(values?.schedule),
                    status: status as Status,
                    cancellationReason: values?.cancellationReason
                },
                type
            }

            const updatedAppointment = await updateAppointment(appointmentToUpdate)

            if(updatedAppointment){
                setOpen && setOpen(false)
                form.reset() 
            }
        }

    } catch (error) {
        console.log(error)
    }

    setIsLoading(false);
  }

  let buttonLabel

  switch (type) {
    case 'cancel':
        buttonLabel = 'Cancel Appointment'
        break;
    case 'create':
        buttonLabel = 'Create Appointment'
        break;
    case 'schedule':
        buttonLabel = 'Schedule Appointment'
    default:
        break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === 'create' &&
            <section className="mb-12 space-y-4">
                <h1 className="header">New Appointment</h1>
                <p className="text-dark-700">Request a new appointment in 10 seconds</p>
            </section>
        }

        {type !== 'cancel' &&(
            <>
                <CustomFormField
                    fieldType={FormFieldType.SELECT} 
                    control={form.control}
                    name='primaryPhysician'
                    label='Doctor'
                    placeholder="Select a Doctor"
                >
                    {Doctors.map((doctor) => (
                        <SelectItem
                            key={doctor.name}
                            value={doctor.name}
                        >
                            <div className="flex cursor-pointer items-center gap-2">
                                <Image
                                    src={doctor.image}
                                    height={32}
                                    width={32}
                                    alt={doctor.name}
                                    className="rounded-full border border-dark-500"
                                />
                                <p>{doctor.name}</p>
                            </div>
                        </SelectItem>
                    ))}
                </CustomFormField>

                <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="schedule"
                    label="Expected Appointment Date"
                    showTimeSelect
                    dateFormat="MM/dd/yyyy - h:mm aa"
                />

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="reason"
                        label="Reason for Appointment"
                        placeholder="Enter the reason for the appointment"
                    />

                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="note"
                        label="Comments/Notes"
                        placeholder="Leave a note for the doctor"
                    />
                </div>
            </>
        )}

        {type === 'cancel' && (
            <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="cancellationReason"
                label="Reason for Cancellation"
                placeholder="Enter the reason for the cancellation"
            />
        )}
        <SubmitButton
            isLoading={isLoading}
            className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}
        >
            {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
}

export default AppointmentForm