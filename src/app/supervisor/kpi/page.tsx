
"use client"

import * as React from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDb } from "@/lib/data"

const currentSupervisorId = "E002";

export default function SupervisorKpiPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const db = getDb();

    const teamMembers = db.employees.filter(e => e.supervisorId === currentSupervisorId);

    const filteredMembers = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Penilaian KPI Tim</h1>
                <p className="text-muted-foreground">Pilih karyawan untuk memulai penilaian kinerja.</p>
            </div>
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
      
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Daftar Anggota Tim</CardTitle>
                <CardDescription>Pilih anggota tim untuk memberikan penilaian kinerja kuartal ini.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <Link href={`/supervisor/kpi/${member.id}`} key={member.id} className="group">
                        <div className="flex items-center justify-between rounded-lg border p-3 transition-all duration-200 group-hover:border-primary group-hover:shadow-md">
                                <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatar} data-ai-hint="user avatar" />
                                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                        <p className="font-semibold text-sm">{member.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>Tidak ada karyawan yang cocok dengan pencarian Anda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  )
}

    