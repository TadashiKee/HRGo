
"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";

const months = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
];

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }
  return years;
};


export function DashboardFilter() {
    const { toast } = useToast();
    const years = getYears();
    const [selectedMonth, setSelectedMonth] = React.useState<string>(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

    const handleFilterChange = (type: 'month' | 'year', value: string) => {
        let month = selectedMonth;
        let year = selectedYear;

        if (type === 'month') {
            month = value;
            setSelectedMonth(value);
        } else {
            year = value;
            setSelectedYear(value);
        }
        
        const monthLabel = months.find(m => m.value === month)?.label;

        toast({
            title: "Filter Diterapkan",
            description: `Menampilkan data untuk ${monthLabel} ${year}.`
        });
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)}>
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
    )
}
