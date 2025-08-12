
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserX, CheckCircle, TrendingUp, Users2, Target } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from 'recharts';
import { DashboardFilter } from "@/components/dashboard-filter";
import { getDb } from "@/lib/data";

const employeeGrowthData = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 125 },
  { month: 'Mar', count: 130 },
  { month: 'Apr', count: 132 },
  { month: 'Mei', count: 140 },
  { month: 'Jun', count: 152 },
];


export default function OwnerDashboardPage() {
    const [greeting, setGreeting] = React.useState("");
    const db = getDb();

    const totalEmployees = db.employees.filter(e => e.status === "Aktif").length;
    const pendingApprovalsCount = db.leaveRequests.filter(r => r.status === "Menunggu Persetujuan HRD").length + db.resignationRequests.filter(r => r.status === "Tertunda").length;
    
    const departmentData = db.employees.reduce((acc, employee) => {
        const dept = acc.find(d => d.name === employee.department);
        if (dept) {
            dept.value++;
        } else {
            acc.push({ name: employee.department, value: 1, color: `hsl(var(--chart-${acc.length + 1}))`});
        }
        return acc;
    }, [] as {name: string, value: number, color: string}[]);

    const kpiByDepartmentData = db.employees.reduce((acc, employee) => {
        const lastKpi = db.kpiHistory.filter(k => k.employeeId === employee.id).sort((a,b) => b.quarter.localeCompare(a.quarter))[0];
        if(!lastKpi) return acc;

        const dept = acc.find(d => d.name === employee.department);
        if (dept) {
            dept.scores.push(lastKpi.score);
        } else {
            acc.push({ name: employee.department, scores: [lastKpi.score], fill: `hsl(var(--chart-${acc.length + 1}))` });
        }
        return acc;
    }, [] as {name: string, scores: number[], fill: string}[]).map(d => ({
        name: d.name,
        score: Number((d.scores.reduce((a,b) => a+b, 0) / d.scores.length).toFixed(1)),
        fill: d.fill,
    }));


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
          <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard Owner</h1>
          {greeting && <p className="text-muted-foreground">{greeting}, Owner!</p>}
        </div>
        <DashboardFilter />
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+5.2% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate (Bulan Ini)</CardTitle>
            <UserX className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.97%</div>
             <p className="text-xs text-muted-foreground">3 karyawan resign</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Persetujuan Tertunda</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovalsCount}</div>
            <p className="text-xs text-muted-foreground">{db.resignationRequests.filter(r => r.status === "Tertunda").length} resign, {db.leaveRequests.filter(r => r.status === "Menunggu Persetujuan HRD").length} cuti</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline">Pertumbuhan Jumlah Karyawan</CardTitle>
            </div>
            <CardDescription>Tren jumlah karyawan aktif selama 6 bulan terakhir.</CardDescription>
        </CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={employeeGrowthData}>
                <XAxis
                    dataKey="month"
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
                    domain={[100, 'auto']}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar dataKey="count" name="Jumlah Karyawan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
        </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Users2 className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline">Komposisi Departemen</CardTitle>
                </div>
                <CardDescription>Distribusi karyawan di setiap departemen.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                             {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                             contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                         <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline">KPI Kinerja per Departemen</CardTitle>
                </div>
                <CardDescription>Skor kinerja rata-rata untuk setiap departemen kuartal ini.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={kpiByDepartmentData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                             cursor={{fill: 'hsl(var(--muted))'}}
                        />
                        <Bar dataKey="score" name="Skor KPI" radius={[0, 4, 4, 0]}>
                             {kpiByDepartmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
