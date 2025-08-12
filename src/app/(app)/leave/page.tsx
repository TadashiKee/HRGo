"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const leaveFormSchema = z.object({
  leaveType: z.string({
    required_error: "Silakan pilih jenis cuti.",
  }),
  dateRange: z.object({
    from: z.date({
      required_error: "Tanggal mulai diperlukan.",
    }),
    to: z.date({
      required_error: "Tanggal akhir diperlukan.",
    }),
  }),
  reason: z.string().min(10, { message: "Alasan harus minimal 10 karakter." }).max(160, { message: "Alasan tidak boleh lebih dari 160 karakter." }),
})

type LeaveFormValues = z.infer<typeof leaveFormSchema>

const defaultValues: Partial<LeaveFormValues> = {
  reason: "",
}

const leaveHistory = [
    { id: 'L001', type: 'Cuti Tahunan', from: '2024-04-10', to: '2024-04-12', status: 'Disetujui' },
    { id: 'L002', type: 'Cuti Sakit', from: '2024-05-20', to: '2024-05-20', status: 'Disetujui' },
    { id: 'L003', type: 'Cuti Tidak Dibayar', from: '2024-06-01', to: '2024-06-01', status: 'Ditolak' },
    { id: 'L004', type: 'Cuti Tahunan', from: '2024-07-25', to: '2024-07-28', status: 'Tertunda' },
];

export default function LeavePage() {
    const { toast } = useToast();
    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveFormSchema),
        defaultValues,
    })

    function onSubmit(data: LeaveFormValues) {
        toast({
            title: "Pengajuan Cuti Terkirim",
            description: "Permintaan Anda telah dikirim untuk persetujuan.",
        })
        console.log(data)
        form.reset();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Pengajuan Cuti</h1>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Pengajuan Cuti Baru</CardTitle>
                        <CardDescription>Isi formulir untuk mengajukan cuti.</CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="leaveType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Cuti</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis cuti" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="annual">Cuti Tahunan</SelectItem>
                                                    <SelectItem value="sick">Cuti Sakit</SelectItem>
                                                    <SelectItem value="unpaid">Cuti Tidak Dibayar</SelectItem>
                                                    <SelectItem value="maternity">Cuti Melahirkan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dateRange"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Tanggal Cuti</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value?.from && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value?.from ? (
                                                                field.value.to ? (
                                                                    <>
                                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                                        {format(field.value.to, "LLL dd, y")}
                                                                    </>
                                                                ) : (
                                                                    format(field.value.from, "LLL dd, y")
                                                                )
                                                            ) : (
                                                                <span>Pilih rentang tanggal</span>
                                                            )}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={field.value?.from}
                                                        selected={{from: field.value?.from, to: field.value?.to }}
                                                        onSelect={field.onChange}
                                                        numberOfMonths={2}
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
                                            <FormLabel>Alasan</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Beri tahu kami mengapa Anda memerlukan cuti ini..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit">Kirim Pengajuan</Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Riwayat Cuti</CardTitle>
                        <CardDescription>Pengajuan cuti Anda sebelumnya dan statusnya.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveHistory.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{leave.type}</TableCell>
                                        <TableCell>{`${format(new Date(leave.from), "LLL dd")} - ${format(new Date(leave.to), "LLL dd, y")}`}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={leave.status === 'Disetujui' ? 'default' : leave.status === 'Ditolak' ? 'destructive' : 'secondary'}>
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
