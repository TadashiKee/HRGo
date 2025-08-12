
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Download, X } from "lucide-react"
import { getDb, updateDb } from "@/lib/data"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const currentSupervisorId = "E002";

export default function SupervisorApprovalsPage() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());

    const myTeamIds = db.employees.filter(e => e.supervisorId === currentSupervisorId).map(e => e.id);

    const leaveRequests = db.leaveRequests.filter(req => myTeamIds.includes(req.employeeId) && req.status === "Tertunda");
    const resignationRequests = db.resignationRequests.filter(req => myTeamIds.includes(req.employeeId) && req.status === "Tertunda");

    const getEmployeeName = (employeeId: string) => {
        return db.employees.find(e => e.id === employeeId)?.name || "Karyawan Tidak Dikenal";
    }

    const handleLeaveApproval = (requestId: string, newStatus: "Menunggu Persetujuan HRD" | "Ditolak") => {
        const newLeaveRequests = db.leaveRequests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        updateDb({ ...db, leaveRequests: newLeaveRequests });
        setDb(getDb());

        toast({
            title: `Permintaan ${newStatus === 'Ditolak' ? 'Ditolak' : 'Diteruskan ke HRD'}`,
            description: `Permintaan cuti telah berhasil diproses.`,
        });
    }

    const handleResignationApproval = (requestId: number) => {
         const newResignationRequests = db.resignationRequests.map(req => 
            req.id === requestId ? { ...req, status: "Menunggu Persetujuan HRD" } : req
        );
        
        updateDb({ resignationRequests: newResignationRequests });
        setDb(getDb());

        toast({
            title: `Pengunduran Diri Diproses`,
            description: `Permintaan telah diteruskan ke HRD untuk ditinjau.`,
        });
    }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold tracking-tight">Persetujuan</h1>

      <Tabs defaultValue="leave">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="leave">Persetujuan Cuti</TabsTrigger>
          <TabsTrigger value="resignation">Persetujuan Pengunduran Diri</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tinjau Permintaan Cuti</CardTitle>
              <CardDescription>Setujui atau tolak permintaan cuti dari anggota tim Anda.</CardDescription>
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
                                <Button variant="outline" size="sm" onClick={() => handleLeaveApproval(req.id, "Menunggu Persetujuan HRD")}>
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
                        <p>Tidak ada permintaan cuti yang tertunda.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resignation" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tinjau Permintaan Pengunduran Diri</CardTitle>
              <CardDescription>Proses permintaan pengunduran diri dari anggota tim Anda.</CardDescription>
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
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Surat Pengunduran Diri
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground border-l-2 pl-3 mt-3 italic">"{req.reason}"</p>
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 pt-2 border-t mt-4">
                             <Button variant="outline" size="sm" onClick={() => handleResignationApproval(req.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Proses & Teruskan ke HRD
                            </Button>
                            <Button variant="secondary" size="sm">
                                Hubungi Karyawan
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>Tidak ada permintaan pengunduran diri yang tertunda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
