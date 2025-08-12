"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const resignationFormSchema = z.object({
  lastDay: z.date({
    required_error: "Silakan pilih hari kerja terakhir Anda.",
  }),
  reason: z.string().min(10, { message: "Alasan harus minimal 10 karakter." }),
})

type ResignationFormValues = z.infer<typeof resignationFormSchema>

const defaultValues: Partial<ResignationFormValues> = {
  reason: "",
}

export default function ResignationPage() {
    const { toast } = useToast();
    const form = useForm<ResignationFormValues>({
        resolver: zodResolver(resignationFormSchema),
        defaultValues,
    })

    function onSubmit(data: ResignationFormValues) {
        toast({
            title: "Pengajuan Pengunduran Diri Terkirim",
            description: "Permintaan Anda telah diterima. HR akan segera menghubungi Anda.",
            variant: "default",
        })
        console.log(data)
        form.reset();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Ajukan Pengunduran Diri</h1>
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Formulir Pengunduran Diri</CardTitle>
                        <CardDescription>Silakan lengkapi formulir ini untuk mengajukan pengunduran diri Anda.</CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Penting</AlertTitle>
                                    <AlertDescription>
                                        Mengirimkan formulir ini akan memulai proses off-boarding. Harap diskusikan dengan manajer Anda sebelum mengirimkan. Masa pemberitahuan Anda adalah 30 hari.
                                    </AlertDescription>
                                </Alert>
                                <FormField
                                    control={form.control}
                                    name="lastDay"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Usulan Hari Kerja Terakhir</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pilih tanggal</span>
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
                                                            date < new Date(new Date().setHours(0,0,0,0))
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
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alasan Berhenti</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Harap berikan alasan pengunduran diri Anda."
                                                    className="resize-none"
                                                    rows={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" variant="destructive">Saya mengerti, Kirim Pengunduran Diri</Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    )
}
