
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

export default function HrdApprovalsPage() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());

    const leaveRequests = db.leaveRequests.filter(req => req.status === "Menunggu Persetujuan HRD");
    const approvedOrRejectedLeaveRequests = db.leaveRequests.filter(req => req.status === "Disetujui" || req.status === "Ditolak").sort((a,b) => b.dates.from.getTime() - a.dates.from.getTime());
    const pendingResignationRequests = db.resignationRequests.filter(req => req.status === "Menunggu Persetujuan HRD");
    const processedResignationRequests = db.resignationRequests.filter(req => req.status !== "Tertunda" && req.status !== "Menunggu Persetujuan HRD");


    const getEmployee = (employeeId: string) => {
        return db.employees.find(e => e.id === employeeId);
    }
    const getEmployeeName = (employeeId: string) => {
        return getEmployee(employeeId)?.name || "Karyawan Tidak Dikenal";
    }

    const handleLeaveApproval = (requestId: string, newStatus: "Menunggu Persetujuan Owner" | "Ditolak") => {
        const newLeaveRequests = db.leaveRequests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        
        updateDb({ leaveRequests: newLeaveRequests });
        setDb(getDb());

        toast({
            title: `Permintaan ${newStatus === 'Ditolak' ? 'Ditolak' : 'Diteruskan ke Owner'}`,
            description: `Permintaan cuti telah berhasil di proses.`,
        });
    }

    const handleResignationApproval = (requestId: number) => {
         const newResignationRequests = db.resignationRequests.map(req => 
            req.id === requestId ? { ...req, status: "Menunggu Persetujuan Owner" } : req
        );
        
        updateDb({ resignationRequests: newResignationRequests });
        setDb(getDb());

        toast({
            title: `Pengunduran Diri Diproses`,
            description: `Permintaan telah diteruskan ke Owner untuk persetujuan final.`,
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
              <CardDescription>Berikan persetujuan atau tolak permintaan cuti sebelum diteruskan ke Owner.</CardDescription>
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
                            <Button variant="outline" size="sm" onClick={() => handleLeaveApproval(req.id, "Menunggu Persetujuan Owner")}>
                                <Check className="mr-2 h-4 w-4" />
                                Setujui & Teruskan
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
                <CardTitle className="font-headline text-lg">Riwayat Persetujuan Cuti</CardTitle>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-4">
                {approvedOrRejectedLeaveRequests.map((req) => (
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
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <p className={`text-sm font-medium ${req.status === 'Disetujui' ? 'text-green-600' : 'text-red-600'}`}>
                            {req.status}
                        </p>
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
              <CardDescription>Proses permintaan pengunduran diri dari karyawan untuk diteruskan ke Owner.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingResignationRequests.length > 0 ? (
                <ul className="space-y-4">
                  {pendingResignationRequests.map((req) => (
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
                          <Button variant="outline" size="sm" onClick={() => handleResignationApproval(req.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              Proses & Teruskan ke Owner
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
          
          <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Riwayat Pengunduran Diri</CardTitle>
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
                    <p>Belum ada riwayat pengunduran diri.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
