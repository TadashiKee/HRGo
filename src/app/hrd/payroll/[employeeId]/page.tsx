
"use client"

import * as React from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ArrowLeft, FileUp, CheckCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDb } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 3; i--) {
    years.push(i.toString());
  }
  return years;
};

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "LLLL", { locale: id }),
}));


export default function ManagePayslipPage() {
    const params = useParams();
    const { toast } = useToast();
    const employeeId = params.employeeId as string;

    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());
    const years = getYears();

    // In a real app, this would be fetched from a database
    const [uploadedSlips, setUploadedSlips] = React.useState<string[]>(['2024-5', '2024-4']); // year-month

    const db = getDb();
    const employee = db.employees.find(e => e.id === employeeId);

    const handleUpload = (period: string) => {
        setUploadedSlips(prev => [...prev, period]);
        toast({
            title: "Unggah Berhasil!",
            description: `Slip gaji untuk ${employee?.name} periode ${period.split('-')[1]}/${period.split('-')[0]} telah diunggah.`,
        })
    }

    if (!employee) {
        return notFound();
    }
  
    return (
        <div className="space-y-6">
            <div>
                <Button variant="outline" asChild>
                    <Link href="/hrd/payroll">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Karyawan
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage src={employee.avatar} data-ai-hint="user avatar" />
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="font-headline text-2xl">Kelola Slip Gaji: {employee.name}</CardTitle>
                                <CardDescription>{employee.position} &middot; {employee.department}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {months.map(month => {
                             const periodKey = `${selectedYear}-${month.value}`;
                             const isUploaded = uploadedSlips.includes(periodKey);
                             const periodLabel = `${month.label} ${selectedYear}`;

                            return (
                                <div key={periodKey} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex flex-col">
                                        <p className="font-semibold">{periodLabel}</p>
                                         {isUploaded ? (
                                            <div className="flex items-center text-sm text-green-600 mt-1">
                                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                                <span>Sudah Diunggah</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <Clock className="mr-1.5 h-4 w-4" />
                                                <span>Menunggu Unggahan</span>
                                            </div>
                                        )}
                                    </div>
                                    {!isUploaded && (
                                         <Button asChild variant="outline" size="sm">
                                            <label htmlFor={`upload-${periodKey}`} className="cursor-pointer">
                                                <FileUp className="mr-2 h-4 w-4"/>
                                                Unggah
                                                <Input id={`upload-${periodKey}`} type="file" className="hidden" onChange={() => handleUpload(periodKey)} />
                                            </label>
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
