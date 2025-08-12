
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";

const payslips = [
  { period: "Juni 2024" },
  { period: "Mei 2024" },
  { period: "April 2024" },
  { period: "Maret 2024" },
  { period: "Februari 2024" },
  { period: "Januari 2024" },
  { period: "Desember 2023" },
  { period: "November 2023" },
  { period: "Oktober 2023" },
];

export default function PayslipsPage() {
    const { toast } = useToast();
    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

    const filteredPayslips = payslips.filter(slip => slip.period.includes(selectedYear));
    const availableYears = Array.from(new Set(payslips.map(slip => slip.period.split(' ')[1]))).sort((a,b) => b.localeCompare(a));
    
    const handleDownload = (period: string) => {
        toast({
            title: "Mengunduh Slip Gaji...",
            description: `Slip gaji untuk periode ${period} sedang diunduh.`
        });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Slip Gaji</h1>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Riwayat Slip Gaji Anda</CardTitle>
                        <CardDescription>Akses dan unduh slip gaji Anda untuk setiap periode.</CardDescription>
                    </div>
                     <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {filteredPayslips.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredPayslips.map((slip) => (
                                <div key={slip.period} className="flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <FileText className="h-6 w-6 text-muted-foreground"/>
                                    </div>
                                    <p className="font-semibold">{slip.period}</p>
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(slip.period)}>
                                        <Download className="mr-2 h-4 w-4"/>
                                        Unduh
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Tidak ada data slip gaji untuk tahun {selectedYear}.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
