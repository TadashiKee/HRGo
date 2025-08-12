
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Download, X } from "lucide-react"
import { getDb, updateDb } from "@/lib/data"
import { format, differenceInBusinessDays } from "date-fns"
import { id } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ApprovalsPage() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());

    const leaveRequests = db.leaveRequests.filter(req => req.status === "Menunggu Persetujuan Owner");
    const resignationRequests = db.resignationRequests.filter(req => req.status === "Menunggu Persetujuan Owner");
    
    const processedLeaveRequests = db.leaveRequests.filter(req => req.status === "Disetujui" || req.status === "Ditolak").sort((a,b) => b.dates.from.getTime() - a.dates.from.getTime());
    const processedResignationRequests = db.resignationRequests.filter(req => req.status === "Disetujui" || req.status === "Ditolak").sort((a,b) => b.id - a.id);


    const getEmployee = (employeeId: string) => {
        return db.employees.find(e => e.id === employeeId);
    }

    const getEmployeeName = (employeeId: string) => {
        return getEmployee(employeeId)?.name || "Karyawan Tidak Dikenal";
    }

    const handleLeaveApproval = (requestId: string, newStatus: "Disetujui" | "Ditolak") => {
        const request = db.leaveRequests.find(req => req.id === requestId);
        if (!request) return;

        let newEmployees = [...db.employees];
        if (newStatus === "Disetujui" && request.type === "Cuti Tahunan") {
            const employee = getEmployee(request.employeeId);
            if(employee) {
                const leaveDays = differenceInBusinessDays(request.dates.to, request.dates.from) + 1;
                newEmployees = db.employees.map(emp => {
                    if (emp.id === request.employeeId) {
                        return { ...emp, leaveBalance: emp.leaveBalance - leaveDays };
                    }
                    return emp;
                });
            }
        }
        
        const newLeaveRequests = db.leaveRequests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        
        updateDb({ employees: newEmployees, leaveRequests: newLeaveRequests });
        setDb(getDb());

        toast({
            title: `Permintaan ${newStatus}`,
            description: `Permintaan cuti telah berhasil di proses.`,
        });
    }
    
    const handleResignationApproval = (requestId: number, newStatus: "Disetujui" | "Ditolak") => {
         const newResignationRequests = db.resignationRequests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        
        updateDb({ resignationRequests: newResignationRequests });
        setDb(getDb());

        toast({
            title: `Pengunduran Diri ${newStatus}`,
            description: `Proses pengunduran diri telah difinalisasi.`,
        });
    }

    const handleDownload = () => {
        toast({
            title: "Mengunduh Dokumen...",
            description: "Surat pengunduran diri sedang diunduh."
        });
    }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold tracking-tight">Persetujuan Final</h1>

      <Tabs defaultValue="leave">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="leave">Persetujuan Cuti</TabsTrigger>
          <TabsTrigger value="resignation">Persetujuan Pengunduran Diri</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tinjau Permintaan Cuti</CardTitle>
              <CardDescription>Berikan persetujuan akhir atau tolak permintaan cuti dari karyawan.</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length > 0 ? (
                <ul className="space-y-4">
                    {leaveRequests.map((req) => (
                    <li key={req.id} className="space-y-3 rounded-lg border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                            <div>
                                <p className="font-semibold">{getEmployeeName(req.employeeId)}</p>
                                <p className="text-sm text-muted-foreground">{req.type}</p>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                                <p>{`${format(req.dates.from, "d LLL", {locale: id})} - ${format(req.dates.to, "d LLL y", {locale: id})}`}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">"{req.reason}"</p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => handleLeaveApproval(req.id, "Disetujui")}>
                                <Check className="mr-2 h-4 w-4" />
                                Setujui
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleLeaveApproval(req.id, "Ditolak")}>
                                <X className="mr-2 h-4 w-4" />
                                Tolak
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
               ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>Tidak ada permintaan cuti yang menunggu persetujuan.</p>
                </div>
               )}
            </CardContent>
          </Card>
          
           <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Riwayat Keputusan Cuti</CardTitle>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-4">
                {processedLeaveRequests.map((req) => (
                  <li key={req.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div>
                            <p className="font-semibold">{getEmployeeName(req.employeeId)}</p>
                            <p className="text-sm text-muted-foreground">{req.type}</p>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                             <Badge variant={req.status === 'Disetujui' ? 'default' : 'destructive'}>{req.status}</Badge>
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resignation" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tinjau Permintaan Pengunduran Diri</CardTitle>
              <CardDescription>Berikan persetujuan final untuk proses pengunduran diri karyawan.</CardDescription>
            </CardHeader>
            <CardContent>
              {resignationRequests.length > 0 ? (
                <ul className="space-y-4">
                    {resignationRequests.map((req) => (
                    <li key={req.id} className="space-y-4 rounded-lg border p-4">
                        <div>
                            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                                <div>
                                    <p className="font-semibold">{getEmployeeName(req.employeeId)}</p>
                                    <p className="text-sm text-muted-foreground">Usulan Hari Terakhir: {req.lastDay}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Surat Pengunduran Diri
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground border-l-2 pl-3 mt-3 italic">"{req.reason}"</p>
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 pt-2 border-t mt-4">
                             <Button variant="outline" size="sm" onClick={() => handleResignationApproval(req.id, "Disetujui")}>
                                <Check className="mr-2 h-4 w-4" />
                                Setujui Pengunduran Diri
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleResignationApproval(req.id, "Ditolak")}>
                                <X className="mr-2 h-4 w-4" />
                                Tolak
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Tidak ada permintaan pengunduran diri yang menunggu persetujuan.</p>
                    </div>
                )}
            </CardContent>
          </Card>

           <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Riwayat Keputusan Pengunduran Diri</CardTitle>
            </CardHeader>
            <CardContent>
              {processedResignationRequests.length > 0 ? (
                 <ul className="space-y-4">
                  {processedResignationRequests.map((req) => (
                    <li key={req.id} className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                          <div>
                              <p className="font-semibold">{getEmployeeName(req.employeeId)}</p>
                              <p className="text-sm text-muted-foreground">Hari Terakhir: {req.lastDay}</p>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                              <Badge variant={req.status === 'Disetujui' ? 'default' : 'destructive'}>{req.status}</Badge>
                          </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>Belum ada riwayat pengunduran diri yang diproses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
