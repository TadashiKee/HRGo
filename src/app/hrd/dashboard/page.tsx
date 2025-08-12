
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LogOut, CalendarCheck, Clock, TrendingDown, CalendarOff, AlertTriangle, FileClock } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from 'recharts';
import { DashboardFilter } from "@/components/dashboard-filter";
import { getDb } from "@/lib/data";
import { differenceInMonths, format } from "date-fns";
import { id } from "date-fns/locale";


const employeeTurnoverData = [
  { name: 'Jan', Masuk: 4, Keluar: 2 },
  { name: 'Feb', Masuk: 3, Keluar: 1 },
  { name: 'Mar', Masuk: 5, Keluar: 3 },
  { name: 'Apr', Masuk: 4, Keluar: 2 },
  { name: 'Mei', Masuk: 6, Keluar: 1 },
  { name: 'Jun', Masuk: 5, Keluar: 3 },
];

export default function HrdDashboardPage() {
  const [greeting, setGreeting] = React.useState("");
  const db = getDb();
  const activeEmployeesCount = db.employees.filter(e => e.status === "Aktif").length;
  const pendingLeaveRequestsCount = db.leaveRequests.filter(e => e.status === "Menunggu Persetujuan HRD").length;

  const expiringContracts = db.employees.filter(e => {
    const monthsUntilExpiry = differenceInMonths(e.contractEndDate, new Date());
    return monthsUntilExpiry >= 0 && monthsUntilExpiry <= 2;
  });

  const teamKpiData = React.useMemo(() => {
    const quarters = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];
    return quarters.map(quarter => {
        const scores = db.kpiHistory
            .filter(kpi => kpi.quarter === quarter)
            .map(kpi => kpi.score);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return { quarter, score: Number(avgScore.toFixed(1)) };
    });
  }, [db.kpiHistory]);

  const underperformingEmployees = React.useMemo(() => {
    return db.employees.map(employee => {
        const history = db.kpiHistory
            .filter(k => k.employeeId === employee.id)
            .sort((a, b) => a.quarter.localeCompare(b.quarter));
        
        if (history.length < 2) return null;
        
        const lastScore = history[history.length - 1].score;
        const prevScore = history[history.length - 2].score;
        
        if (lastScore < prevScore) {
            const decrease = (((prevScore - lastScore) / prevScore) * 100).toFixed(0);
            return {
                name: employee.name,
                decrease: `${decrease}%`
            };
        }
        return null;
    }).filter(Boolean);
  }, [db.employees, db.kpiHistory]);

  const potentialBurnoutEmployees = React.useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activeEmployees = db.employees.filter(e => e.status === 'Aktif' && e.role !== 'owner');
    
    return activeEmployees.filter(employee => {
        const recentLeave = db.leaveRequests.find(req => 
            req.employeeId === employee.id && 
            req.dates.from > sixMonthsAgo &&
            req.status === 'Disetujui'
        );
        return !recentLeave;
    }).map(e => e.name);
  }, [db.employees, db.leaveRequests]);


  React.useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Selamat Pagi";
      if (hour < 18) return "Selamat Siang";
      return "Selamat Malam";
    };
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard HRD</h1>
          {greeting && <p className="text-muted-foreground">{greeting}, Amanda Lee!</p>}
        </div>
        <DashboardFilter />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan Aktif</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployeesCount}</div>
            <p className="text-xs text-muted-foreground">+5 dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Karyawan Resign (Bulan Ini)</CardTitle>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
             <p className="text-xs text-muted-foreground">+1 dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permintaan Cuti</CardTitle>
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaveRequestsCount}</div>
            <p className="text-xs text-muted-foreground">Menunggu persetujuan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Kehadiran</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
             <p className="text-xs text-muted-foreground">Rata-rata bulan ini</p>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Grafik Turnover Karyawan</CardTitle>
                <CardDescription>Perbandingan jumlah karyawan yang masuk dan keluar selama 6 bulan terakhir.</CardDescription>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={employeeTurnoverData}>
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            cursor={{fill: 'hsl(var(--muted))'}}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="Masuk" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Keluar" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Grafik Tren KPI Seluruh Karyawan</CardTitle>
                    <CardDescription>Rata-rata skor KPI seluruh karyawan selama 4 kuartal terakhir.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={teamKpiData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[70, 100]} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                                cursor={{stroke: 'hsl(var(--muted))', strokeWidth: 2}}
                            />
                            <Legend iconType="circle" />
                            <Line type="monotone" dataKey="score" name="Skor Rata-rata" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <CardTitle className="font-headline">Perlu Perhatian</CardTitle>
                </div>
                <CardDescription>Daftar hal-hal penting yang memerlukan tindak lanjut dari HRD.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ul className="divide-y">
                    {underperformingEmployees.map((employee, index) => (
                        <li key={`perf-${index}`} className="flex items-center gap-4 p-3">
                            <TrendingDown className="h-6 w-6 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Kinerja Menurun</p>
                                <p className="text-sm text-muted-foreground">Performa <span className="font-semibold text-foreground">{employee?.name}</span> menurun {employee?.decrease} pada kuartal ini. Perlu penjadwalan sesi 1-on-1.</p>
                            </div>
                        </li>
                    ))}
                    {potentialBurnoutEmployees.length > 0 && (
                        <li className="flex items-center gap-4 p-3">
                            <CalendarOff className="h-6 w-6 text-blue-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Potensi Kelelahan (Burnout)</p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{potentialBurnoutEmployees.join(', ')}</span> belum mengambil cuti dalam 6 bulan terakhir.
                                </p>
                            </div>
                        </li>
                    )}
                    {expiringContracts.map((employee) => (
                        <li key={employee.id} className="flex items-center gap-4 p-3">
                            <FileClock className="h-6 w-6 text-orange-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Kontrak Akan Berakhir</p>
                                <p className="text-sm text-muted-foreground">
                                    Kontrak <span className="font-semibold text-foreground">{employee.name}</span> akan berakhir pada <span className="font-semibold text-foreground">{format(employee.contractEndDate, "d MMMM yyyy", { locale: id })}</span>.
                                </p>
                            </div>
                        </li>
                    ))}
                 </ul>
            </CardContent>
        </Card>
    </div>
  );
}
