
"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, Info, Target } from "lucide-react"
import { DashboardFilter } from "@/components/dashboard-filter"
import { getDb, LeaveRequest, Employee } from "@/lib/data"
import { EmployeeNotifications } from "@/components/employee-notifications"

const kpiChartConfig = {
  score: {
    label: "Skor KPI",
    color: "hsl(var(--primary))",
  },
};

const currentUserId = "E002";

export default function SupervisorDashboardPage() {
    const [greeting, setGreeting] = React.useState("");
    const db = getDb();
    const announcements = db.announcements.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const currentUser = db.employees.find(e => e.id === currentUserId) as Employee;
    const myLeaveHistory = db.leaveRequests.filter(req => req.employeeId === currentUserId).sort((a,b) => b.dates.from.getTime() - a.dates.from.getTime());
    
    const myKpiData = db.kpiHistory.filter(kpi => kpi.employeeId === currentUserId).sort((a,b) => a.quarter.localeCompare(b.quarter));
    
    const teamKpiData = React.useMemo(() => {
        const teamMemberIds = db.employees.filter(e => e.supervisorId === currentUserId).map(e => e.id);
        const quarters = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];
        
        return quarters.map(quarter => {
            const scores = db.kpiHistory
                .filter(kpi => teamMemberIds.includes(kpi.employeeId) && kpi.quarter === quarter)
                .map(kpi => kpi.score);
            
            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return { quarter, score: Number(avgScore.toFixed(1)) };
        });
    }, [db.employees, db.kpiHistory]);


    React.useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Selamat Pagi";
            if (hour < 18) return "Selamat Siang";
            return "Selamat Malam";
        };
        setGreeting(getGreeting());
    }, []);

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
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard Supervisor</h1>
                {greeting && <p className="text-muted-foreground">{greeting}, {currentUser.name}!</p>}
            </div>
            <DashboardFilter />
        </div>

        <EmployeeNotifications employee={currentUser} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-primary" />
                            <CardTitle className="font-headline">Tren KPI Kuartalan Tim</CardTitle>
                        </div>
                        <CardDescription>Performa keseluruhan tim Anda selama 4 kuartal terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={kpiChartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <LineChart data={teamKpiData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                                    <YAxis domain={[70, 100]} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 5, fill: "hsl(var(--accent))" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-primary" />
                            <CardTitle className="font-headline">KPI Kuartalan Pribadi Saya</CardTitle>
                        </div>
                        <CardDescription>Performa Anda selama 4 kuartal terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={kpiChartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <LineChart data={myKpiData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                                    <YAxis domain={[70, 100]} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 5, fill: "hsl(var(--primary))" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="font-headline">Sisa Cuti Saya</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-primary">{currentUser.leaveBalance}</p>
                        <p className="text-muted-foreground">Hari</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                       <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <CardTitle className="font-headline">Riwayat Cuti Saya</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myLeaveHistory.slice(0, 3).map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{leave.type}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={getBadgeVariant(leave.status)}>
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle className="font-headline">Pengumuman</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {announcements.map((item) => (
                                <AccordionItem value={item.id} key={item.id}>
                                <AccordionTrigger>
                                    <div className="flex flex-col items-start text-left">
                                        <p className="font-semibold text-sm">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(item.date, "PPP", {locale: id})}
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {item.content}
                                </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
