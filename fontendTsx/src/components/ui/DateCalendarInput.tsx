"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Input from "../Input"
import FormField from "../FormField"
import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "./calendar"

type DateCalendarInputProps<T extends FieldValues> = {
  register: UseFormRegister<T>
  errors?: FieldErrors<T>
  fromName: keyof T
  toName: keyof T
  dateName: keyof T
}

export function DateCalendarInput<T extends FieldValues>({
  register,
  errors,
  fromName,
  toName,
  dateName,
}: DateCalendarInputProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-6">
      {/* Date */}
      <FormField label="Date" error={errors?.[dateName] as any}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={dateName as string}
              className="w-full justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate: React.SetStateAction<Date | undefined>) => {
                setDate(selectedDate)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </FormField>

      {/* Time inputs */}
      <div className="flex gap-4">
        <FormField label="From" error={errors?.[fromName] as any}>
          <Input
            type="time"
            register={register}
            step="1"
            defaultValue="10:30:00"
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            errors={errors}
            name={fromName as any}
          />
        </FormField>

        <FormField label="To" error={errors?.[toName] as any}>
          <Input
            type="time"

            register={register}

            step="1"
            defaultValue="12:30:00"
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            errors={errors}
            name={toName as any}
          />
        </FormField>
      </div>
    </div>
  )
}
