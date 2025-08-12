
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Send, Info, Cake, Calendar, Trash2 } from "lucide-react"
import { getDb, updateDb, Announcement } from "@/lib/data"
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

const announcementSchema = z.object({
  title: z.string().min(5, { message: "Judul harus minimal 5 karakter." }),
  content: z.string().min(20, { message: "Isi pengumuman harus minimal 20 karakter." }),
  type: z.string({ required_error: "Tipe pengumuman wajib dipilih." }),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

export default function HrdAnnouncementsPage() {
    const { toast } = useToast()
    const [db, setDb] = React.useState(getDb())
    const announcements = db.announcements.sort((a, b) => b.date.getTime() - a.date.getTime());

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    })

    function onSubmit(data: AnnouncementFormValues) {
        const newAnnouncement: Announcement = {
            id: `annc-${Date.now()}`,
            date: new Date(),
            ...data,
            type: data.type as Announcement['type']
        }
        
        const newDb = { ...db, announcements: [...db.announcements, newAnnouncement] };
        updateDb(newDb);
        setDb(getDb());

        toast({
            title: "Pengumuman Terkirim!",
            description: "Pengumuman baru telah berhasil dipublikasikan.",
        })
        form.reset()
    }

    const handleDelete = (announcementId: string) => {
        const newAnnouncements = db.announcements.filter(ann => ann.id !== announcementId);
        updateDb({ ...db, announcements: newAnnouncements });
        setDb(getDb());
        toast({
            title: "Pengumuman Dihapus",
            description: "Pengumuman telah berhasil dihapus.",
            variant: "destructive",
        });
    }

    const getIconForType = (type: string) => {
        switch(type) {
            case 'Ulang Tahun': return <Cake className="h-5 w-5 text-pink-500" />;
            case 'Acara Perusahaan': return <Calendar className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-primary" />;
        }
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Buat & Kelola Pengumuman</h1>
                <p className="text-muted-foreground">Publikasikan informasi penting untuk seluruh karyawan perusahaan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle className="font-headline">Buat Pengumuman Baru</CardTitle>
                                <CardDescription>Tulis dan publikasikan pengumuman baru di sini.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Judul Pengumuman</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Jadwal Libur Nasional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipe Pengumuman</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih tipe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Informasi Umum">Informasi Umum</SelectItem>
                                                    <SelectItem value="Acara Perusahaan">Acara Perusahaan</SelectItem>
                                                    <SelectItem value="Ulang Tahun">Ulang Tahun</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Isi Pengumuman</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tuliskan detail pengumuman di sini..."
                                                    className="resize-y"
                                                    rows={6}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Pengumuman
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Riwayat Pengumuman</CardTitle>
                        <CardDescription>Daftar pengumuman yang telah dipublikasikan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {announcements.length > 0 ? (
                             <ul className="space-y-4">
                                {announcements.map((item) => (
                                    <li key={item.id} className="flex gap-4 rounded-lg border p-4 group">
                                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mt-1 flex-shrink-0">
                                            {getIconForType(item.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {format(item.date, "PPP 'pukul' HH:mm", {locale: id})} &middot; {item.type}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {item.content}
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tindakan ini akan menghapus pengumuman secara permanen.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </li>
                                ))}
                             </ul>
                        ) : (
                             <div className="text-center py-16 text-muted-foreground">
                                <p>Belum ada pengumuman yang dibuat.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
