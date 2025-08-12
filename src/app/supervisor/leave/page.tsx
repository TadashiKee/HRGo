
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, UploadCloud, Trash2, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { getDb, updateDb, LeaveRequest, Employee } from "@/lib/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
  doctorNote: z.any().optional(),
}).refine((data) => {
    if (data.leaveType === "Cuti Sakit") {
        return !!data.doctorNote && data.doctorNote.length > 0;
    }
    return true;
}, {
    message: "Surat dokter wajib diunggah untuk Cuti Sakit.",
    path: ["doctorNote"],
}).refine((data) => {
    if (data.leaveType === "Cuti Sakit" && data.doctorNote && data.doctorNote.length > 0) {
        return data.doctorNote?.[0]?.size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `Ukuran file maksimal adalah 5MB.`,
    path: ["doctorNote"],
}).refine((data) => {
    if (data.leaveType === "Cuti Sakit" && data.doctorNote && data.doctorNote.length > 0) {
         return ACCEPTED_IMAGE_TYPES.includes(data.doctorNote?.[0]?.type);
    }
    return true;
}, {
    message: "Format file yang diterima hanya .jpg, .jpeg, .png dan .webp.",
    path: ["doctorNote"],
});


type LeaveFormValues = z.infer<typeof leaveFormSchema>

const defaultValues: Partial<LeaveFormValues> = {
  reason: "",
}

// Mock current user
const currentUserId = "E002";

export default function SupervisorLeavePage() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const currentUser = db.employees.find(e => e.id === currentUserId) as Employee;
    const leaveHistory = db.leaveRequests.filter(req => req.employeeId === currentUserId).sort((a, b) => b.dates.from.getTime() - a.dates.from.getTime());
    
    const [selectedLeaveType, setSelectedLeaveType] = React.useState<string | undefined>();
    
    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveFormSchema),
        defaultValues,
    })

    const needsFileUpload = selectedLeaveType === 'Cuti Sakit';

    function onSubmit(data: LeaveFormValues) {
        setIsSubmitting(true);
        const newLeaveRequest: LeaveRequest = {
            id: `L${Date.now()}`,
            employeeId: currentUserId,
            type: data.leaveType as LeaveRequest["type"],
            dates: { from: data.dateRange.from, to: data.dateRange.to },
            reason: data.reason,
            // Supervisor requests go directly to HR
            status: "Menunggu Persetujuan HRD",
        }

        const newDb = { ...db, leaveRequests: [...db.leaveRequests, newLeaveRequest]};
        updateDb(newDb);
        
        // Simulate API call
        setTimeout(() => {
            setDb(getDb());
            toast({
                title: "Pengajuan Cuti Terkirim",
                description: "Permintaan Anda telah dikirim untuk persetujuan HRD.",
            })
            form.reset();
            setSelectedLeaveType(undefined);
            setIsSubmitting(false);
        }, 1000);
    }

    const handleCancelRequest = (requestId: string) => {
         const newLeaveRequests = db.leaveRequests.filter(req => req.id !== requestId);
         const newDb = { ...db, leaveRequests: newLeaveRequests };
         updateDb(newDb);
         setDb(getDb());

         toast({
            title: "Pengajuan Dibatalkan",
            description: "Pengajuan cuti Anda telah berhasil dibatalkan.",
         })
    }

    const getBadgeVariant = (status: LeaveRequest["status"]) => {
        switch (status) {
            case "Disetujui": return "default";
            case "Ditolak": return "destructive";
            case "Tertunda": return "secondary";
            case "Menunggu Persetujuan HRD": return "outline";
            default: return "secondary";
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Pengajuan Cuti</h1>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Ajukan Cuti Baru</CardTitle>
                        <CardDescription>Sisa cuti tahunan Anda: {currentUser.leaveBalance} hari.</CardDescription>
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
                                            <Select onValueChange={(value) => {
                                                field.onChange(value);
                                                setSelectedLeaveType(value);
                                            }} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis cuti" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Cuti Tahunan">Cuti Tahunan</SelectItem>
                                                    <SelectItem value="Cuti Sakit">Cuti Sakit</SelectItem>
                                                    <SelectItem value="Cuti Khusus">Cuti Khusus</SelectItem>
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
                                                                        {format(field.value.from, "LLL dd, y", {locale: id})} -{" "}
                                                                        {format(field.value.to, "LLL dd, y", {locale: id})}
                                                                    </>
                                                                ) : (
                                                                    format(field.value.from, "LLL dd, y", {locale: id})
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
                                                        disabled={{ before: new Date() }}
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
                                {needsFileUpload && (
                                    <FormField
                                        control={form.control}
                                        name="doctorNote"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unggah Surat Dokter</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input 
                                                            type="file" 
                                                            className="pl-10"
                                                            accept="image/*"
                                                            onChange={(e) => field.onChange(e.target.files)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    File gambar (JPG, PNG) maks. 5MB.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Kirim Pengajuan
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Riwayat Pengajuan</CardTitle>
                        <CardDescription>Pengajuan cuti Anda sebelumnya dan statusnya.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Tindakan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveHistory.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{leave.type}</TableCell>
                                        <TableCell>{`${format(leave.dates.from, "d LLL", {locale: id})} - ${format(leave.dates.to, "d LLL y", {locale: id})}`}</TableCell>
                                        <TableCell>
                                            <Badge variant={getBadgeVariant(leave.status)}>
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(leave.status === 'Tertunda' || leave.status === 'Menunggu Persetujuan HRD') && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Batalkan</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengajuan cuti Anda secara permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleCancelRequest(leave.id)}>
                                                                Ya, Batalkan
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
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
