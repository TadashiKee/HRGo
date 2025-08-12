
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { add, format } from "date-fns"
import { Calendar as CalendarIcon, Info, UploadCloud, Download, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getDb, updateDb, ResignationRequest } from "@/lib/data"

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const resignationFormSchema = z.object({
  lastDay: z.date({
    required_error: "Silakan pilih hari kerja terakhir Anda.",
  }),
  reason: z.string().min(10, { message: "Alasan harus minimal 10 karakter." }),
  resignationLetter: z.any()
    .refine((files) => files?.length == 1, "Surat pengunduran diri wajib diunggah.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Ukuran file maksimal adalah 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Format file yang diterima hanya .pdf, .doc, .docx"
    ),
  handoverDocument: z.any()
    .refine((files) => files?.length == 1, "Dokumen serah terima wajib diunggah.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Ukuran file maksimal adalah 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Format file yang diterima hanya .pdf, .doc, .docx"
    ),
}).refine((data) => {
    const oneMonthFromNow = add(new Date(), { months: 1 });
    // Set time to 0 to compare dates only
    oneMonthFromNow.setHours(0,0,0,0);
    return data.lastDay >= oneMonthFromNow;
}, {
    message: "Hari kerja terakhir harus minimal 1 bulan dari sekarang.",
    path: ["lastDay"],
});

type ResignationFormValues = z.infer<typeof resignationFormSchema>

const defaultValues: Partial<ResignationFormValues> = {
  reason: "",
}

const currentUserId = "E002";

export default function SupervisorResignationPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const db = getDb();

    const form = useForm<ResignationFormValues>({
        resolver: zodResolver(resignationFormSchema),
        defaultValues,
    })

     function onSubmit(data: ResignationFormValues) {
        setIsSubmitting(true);
        const newRequest: ResignationRequest = {
            id: Date.now(),
            employeeId: currentUserId,
            lastDay: format(data.lastDay, "d MMMM yyyy"),
            reason: data.reason,
            status: "Menunggu Persetujuan HRD", // Supervisor requests go directly to HRD
        };

        const newDb = { ...db, resignationRequests: [...db.resignationRequests, newRequest] };
        updateDb(newDb);

        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Pengajuan Pengunduran Diri Terkirim",
                description: "Permintaan Anda telah diterima dan akan ditinjau oleh HRD.",
            });
            form.reset();
            setIsSubmitting(false);
        }, 1000);
    }
    
    const oneMonthFromNow = add(new Date(), { months: 1 });

    const handleDownload = (templateName: string) => {
        toast({
            title: "Mengunduh Template...",
            description: `File ${templateName} sedang diunduh.`
        })
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Ajukan Pengunduran Diri</h1>
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Formulir Pengunduran Diri</CardTitle>
                        <CardDescription>Silakan lengkapi formulir ini untuk mengajukan pengunduran diri Anda secara resmi.</CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Penting: Pemberitahuan 1 Bulan (One Month Notice)</AlertTitle>
                                    <AlertDescription>
                                        Sesuai kebijakan perusahaan, Anda wajib memberikan pemberitahuan minimal 1 bulan sebelum tanggal berhenti. Mengirimkan formulir ini akan memulai proses off-boarding.
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
                                                            date < oneMonthFromNow
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
                                                    placeholder="Harap berikan alasan pengunduran diri Anda..."
                                                    className="resize-none"
                                                    rows={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="resignationLetter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unggah Surat Pengunduran Diri</FormLabel>
                                            <FormControl>
                                                 <div className="relative">
                                                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input 
                                                        type="file" 
                                                        className="pl-10"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => field.onChange(e.target.files)}
                                                    />
                                                </div>
                                            </FormControl>
                                             <FormDescription>
                                                File PDF, DOC, atau DOCX, maks. 5MB.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <div className="space-y-4 rounded-md border border-dashed p-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Serah Terima Jabatan</h3>
                                        <p className="text-sm text-muted-foreground">Unduh templat, isi, dan unggah kembali dokumen serah terima pekerjaan Anda.</p>
                                    </div>
                                     <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleDownload('template_serah_terima.docx')}>
                                        <Download className="mr-2 h-4 w-4"/>
                                        Unduh Templat Serah Terima
                                    </Button>

                                    <FormField
                                        control={form.control}
                                        name="handoverDocument"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unggah Dokumen Serah Terima</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input 
                                                            type="file" 
                                                            className="pl-10"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={(e) => field.onChange(e.target.files)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    File PDF, DOC, atau DOCX, maks. 5MB.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-6">
                                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Saya Mengerti, Kirim Pengajuan
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    )
}
