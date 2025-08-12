
"use client"

import * as React from "react"
import { BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDb, Employee } from "@/lib/data"
import { Users, Target, CalendarOff, Star } from "lucide-react"
import { format, isWithinInterval, addDays } from "date-fns"
import { id } from "date-fns/locale"

// Mock current supervisor
const currentSupervisorId = "E002";

export default function SupervisorTeamPage() {
    const db = getDb();
    
    const teamMembers = db.employees.filter(e => e.supervisorId === currentSupervisorId);
    const teamMemberIds = teamMembers.map(e => e.id);

    const teamKpiData = React.useMemo(() => {
        return teamMembers.map(member => {
            const lastKpi = db.kpiHistory
                .filter(k => k.employeeId === member.id)
                .sort((a,b) => b.quarter.localeCompare(a.quarter))[0];
            return {
                name: member.name.split(' ')[0], // First name for brevity
                score: lastKpi ? lastKpi.score : 0
            };
        });
    }, [db.kpiHistory, teamMembers]);
    
    const averageKpi = React.useMemo(() => {
        const totalScore = teamKpiData.reduce((acc, curr) => acc + curr.score, 0);
        return teamKpiData.length > 0 ? (totalScore / teamKpiData.length).toFixed(1) : 0;
    }, [teamKpiData]);

    const upcomingLeaves = React.useMemo(() => {
        const today = new Date();
        const next30Days = { start: today, end: addDays(today, 30) };
        return db.leaveRequests.filter(req => 
            teamMemberIds.includes(req.employeeId) &&
            req.status === 'Disetujui' &&
            isWithinInterval(req.dates.from, next30Days)
        );
    }, [db.leaveRequests, teamMemberIds]);

    const getEmployeeName = (employeeId: string) => {
        return db.employees.find(e => e.id === employeeId)?.name || "Karyawan";
    }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Dasbor Tim Saya</h1>
            <p className="text-muted-foreground">Analisis kinerja dan ketersediaan tim Anda dalam satu tampilan.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jumlah Anggota Tim</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                    <p className="text-xs text-muted-foreground">Karyawan aktif di bawah Anda</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rata-rata KPI Tim (Q2)</CardTitle>
                    <Target className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{averageKpi}</div>
                    <p className="text-xs text-muted-foreground">Skor rata-rata kuartal terakhir</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cuti Mendatang (30 Hari)</CardTitle>
                    <CalendarOff className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{upcomingLeaves.length}</div>
                    <p className="text-xs text-muted-foreground">Total pengajuan cuti disetujui</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline">Perbandingan Kinerja KPI Tim (Q2)</CardTitle>
                    </div>
                    <CardDescription>Visualisasi skor kinerja terakhir untuk setiap anggota tim.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={teamKpiData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                                cursor={{fill: 'hsl(var(--muted))'}}
                            />
                            <Bar dataKey="score" name="Skor KPI" radius={[4, 4, 0, 0]}>
                                {teamKpiData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score >= 90 ? "hsl(var(--primary))" : entry.score >= 80 ? "hsl(var(--accent))" : "hsl(var(--destructive))"} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CalendarOff className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline">Jadwal Cuti Tim (30 Hari ke Depan)</CardTitle>
                    </div>
                    <CardDescription>Daftar cuti yang telah disetujui untuk anggota tim Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                     {upcomingLeaves.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingLeaves.map(leave => (
                                <li key={leave.id} className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <p className="font-semibold text-sm">{getEmployeeName(leave.employeeId)}</p>
                                        <p className="text-xs text-muted-foreground">{leave.type}</p>
                                    </div>
                                    <p className="text-sm font-medium">{`${format(leave.dates.from, "d LLL", {locale: id})} - ${format(leave.dates.to, "d LLL y", {locale: id})}`}</p>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Tidak ada jadwal cuti mendatang untuk tim Anda.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
