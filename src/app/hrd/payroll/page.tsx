
"use client"

import * as React from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Search, FileUp, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDb, Employee } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function PayrollPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const db = getDb();
    const { toast } = useToast();
    
    const employees = db.employees.filter(e => e.role !== 'owner');

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTemplateUpload = (templateName: string) => {
        toast({
            title: "Template Diperbarui",
            description: `File templat untuk ${templateName} telah berhasil diunggah.`
        })
    }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Penggajian & Dokumen</h1>
            <p className="text-muted-foreground">Kelola slip gaji per karyawan dan templat dokumen perusahaan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <Wallet className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline">Manajemen Penggajian Karyawan</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                         <CardDescription>Pilih karyawan untuk mengunggah atau melihat riwayat slip gaji mereka.</CardDescription>
                         <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari nama karyawan..."
                                className="pl-8 sm:w-[300px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <Link href={`/hrd/payroll/${employee.id}`} key={employee.id} className="group">
                                    <div className="flex items-center justify-between rounded-lg border p-3 transition-all duration-200 group-hover:border-primary group-hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                    <AvatarImage src={employee.avatar} data-ai-hint="user avatar" />
                                                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{employee.name}</p>
                                                <p className="text-xs text-muted-foreground">{employee.position}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Kelola</Button>
                                    </div>
                                </Link>
                            ))
                        ) : (
                             <div className="col-span-full text-center py-10 text-muted-foreground">
                                <p>Tidak ada karyawan yang cocok dengan pencarian Anda.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline">Manajemen Templat Dokumen</CardTitle>
                <CardDescription>Unggah dan kelola templat standar perusahaan yang akan diunduh oleh karyawan.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label htmlFor="resignation-template-upload">Templat Surat Pengunduran Diri</Label>
                    <div className="flex items-center gap-4 rounded-md border p-3">
                        <p className="text-sm text-muted-foreground flex-1 truncate">template_resign_2024.docx</p>
                        <Input type="file" className="hidden" id="resignation-template-upload" accept=".pdf,.doc,.docx" onChange={() => handleTemplateUpload('Surat Pengunduran Diri')} />
                        <Button asChild variant="outline" size="sm">
                            <label htmlFor="resignation-template-upload">
                                <FileUp className="mr-2 h-4 w-4" />
                                Ganti
                            </label>
                        </Button>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label htmlFor="handover-template-upload">Templat Serah Terima Jabatan</Label>
                    <div className="flex items-center gap-4 rounded-md border p-3">
                         <p className="text-sm text-muted-foreground flex-1 truncate">template_handover_v2.docx</p>
                        <Input type="file" className="hidden" id="handover-template-upload" accept=".pdf,.doc,.docx" onChange={() => handleTemplateUpload('Serah Terima Jabatan')} />
                        <Button asChild variant="outline" size="sm">
                            <label htmlFor="handover-template-upload">
                                 <FileUp className="mr-2 h-4 w-4" />
                                Ganti
                            </label>
                        </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
        </div>
    </div>
  );
}
