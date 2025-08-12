
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Send, ArrowLeft, Plus, X, AlertCircle, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDb, updateDb, KpiAssessment } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface Metric {
  id: string
  name: string
  weight: number
  score: number
  by: 'Supervisor' | 'HRD'
}

export default function HrdKpiAssessmentPage() {
  const { toast } = useToast()
  const params = useParams()
  const employeeId = params.employeeId as string
  const idSuffix = React.useId();

  const [db, setDbState] = React.useState(getDb());
  const employee = React.useMemo(() => db.employees.find(e => e.id === employeeId), [employeeId, db.employees]);
  const supervisorAssessment = React.useMemo(() => db.kpiAssessments.find(a => a.employeeId === employeeId), [employeeId, db.kpiAssessments]);
  
  const [metrics, setMetrics] = React.useState<Metric[]>(() => {
    const initialMetrics: Metric[] = supervisorAssessment 
      ? supervisorAssessment.metrics.map((m, i) => ({ ...m, id: `metric-sv-${i}-${idSuffix}`, by: 'Supervisor' }))
      : [];
    return initialMetrics;
  });
  
  const [supervisorNotes, setSupervisorNotes] = React.useState(supervisorAssessment?.notes || "Supervisor belum memberikan catatan.");
  const [totalScore, setTotalScore] = React.useState(0)
  const [totalWeight, setTotalWeight] = React.useState(0)
  const nextMetricId = React.useRef(metrics.length + 1);


  const handleMetricChange = (id: string, field: keyof Metric, value: string | number) => {
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    )
  }

  const addMetric = () => {
    const newMetric: Metric = {
      id: `metric-hrd-${nextMetricId.current++}-${idSuffix}`,
      name: "",
      weight: 0,
      score: 75,
      by: 'HRD',
    }
    setMetrics(prev => [...prev, newMetric])
  }

  const removeMetric = (id: string) => {
    const metricToRemove = metrics.find(m => m.id === id);
    if (metricToRemove && metricToRemove.by === 'Supervisor') {
        toast({
            variant: "destructive",
            title: "Tidak Dapat Menghapus",
            description: "Metrik yang dinilai oleh Supervisor tidak dapat dihapus."
        })
        return;
    }
    setMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  React.useEffect(() => {
    const newTotalWeight = metrics.reduce((acc, metric) => acc + Number(metric.weight || 0), 0)
    setTotalWeight(newTotalWeight)

    if (newTotalWeight === 100) {
      const newTotalScore = metrics.reduce((acc, metric) => {
        return acc + (metric.score * (metric.weight / 100))
      }, 0)
      setTotalScore(Number(newTotalScore.toFixed(2)))
    } else {
        setTotalScore(0)
    }
  }, [metrics])

  const handlePrint = () => {
    window.print();
  }

  const handleSubmit = () => {
    if (!employee) return;
    
    if (totalWeight !== 100) {
        toast({
            variant: "destructive",
            title: "Bobot Tidak Valid!",
            description: "Total bobot dari semua metrik harus sama dengan 100%."
        })
        return;
    }

    const newKpiEntry = {
        employeeId: employee.id,
        quarter: "Q3 2024", // This should be dynamic in a real app
        score: totalScore,
        finalizedBy: "Amanda Lee"
    };

    const updatedKpiHistory = [...db.kpiHistory, newKpiEntry];
    // Remove the temporary assessment after finalization
    const updatedKpiAssessments = db.kpiAssessments.filter(a => a.employeeId !== employeeId);

    updateDb({ kpiHistory: updatedKpiHistory, kpiAssessments: updatedKpiAssessments });
    setDbState(getDb());

    toast({
        title: "Penilaian Disimpan!",
        description: `Penilaian KPI untuk ${employee.name} telah berhasil difinalisasi.`
    })
    console.log(`Submitting scores for ${employee.name}:`, { metrics, totalScore })
  }

  if (!employee) {
    return notFound();
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Button variant="outline" asChild>
                <Link href="/hrd/kpi">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Karyawan
                </Link>
            </Button>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4"/>
                    Cetak
                </Button>
                <Button onClick={handleSubmit} disabled={totalWeight !== 100}>
                    <Send className="mr-2 h-4 w-4" />
                    Simpan Finalisasi
                </Button>
            </div>
       </div>
        <Card className="print:shadow-none print:border-none">
            <CardHeader>
                <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 border">
                        <AvatarImage src={employee.avatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-2xl">Finalisasi Penilaian Kinerja</CardTitle>
                        <CardDescription>{employee.name} - {employee.role}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {metrics.map((metric) => (
                        <div key={metric.id} className="space-y-3 p-4 border rounded-lg relative print:border-gray-300 print:p-2">
                             <Label className={cn("text-xs px-2 py-0.5 rounded-full absolute -top-2 left-3", metric.by === 'Supervisor' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/20 text-primary-foreground')}>
                                Dinilai oleh: {metric.by}
                            </Label>
                            <div className="grid grid-cols-2 gap-4 pt-3">
                               <div className="space-y-2">
                                    <Label htmlFor={`name-${metric.id}`}>Nama Metrik</Label>
                                    <Input
                                        id={`name-${metric.id}`}
                                        value={metric.name}
                                        onChange={(e) => handleMetricChange(metric.id, 'name', e.target.value)}
                                        placeholder={`Contoh: Kualitas Kerja`}
                                        readOnly={metric.by === 'Supervisor'}
                                    />
                               </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`weight-${metric.id}`}>Bobot (%)</Label>
                                    <Input
                                        id={`weight-${metric.id}`}
                                        type="number"
                                        value={metric.weight}
                                        onChange={(e) => handleMetricChange(metric.id, 'weight', Number(e.target.value))}
                                        placeholder="Contoh: 30"
                                        readOnly={metric.by === 'Supervisor'}
                                    />
                               </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`score-${metric.id}`}>Nilai (0-100)</Label>
                                <div className="flex items-center gap-4">
                                    <Slider
                                        id={`score-${metric.id}`}
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[metric.score]}
                                        onValueChange={(value) => handleMetricChange(metric.id, 'score', value[0])}
                                        disabled={metric.by === 'Supervisor'}
                                    />
                                    <span className="w-12 text-center text-lg font-bold text-primary">{metric.score}</span>
                                </div>
                            </div>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive print:hidden"
                                onClick={() => removeMetric(metric.id)}
                                disabled={metric.by === 'Supervisor'}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                 <div className="flex justify-center mt-6">
                     <Button variant="outline" onClick={addMetric} className="w-full md:w-1/2 print:hidden">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Metrik Penilaian (HRD)
                    </Button>
                 </div>
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start">
                    <Card className="w-full text-center bg-muted/50 print:bg-gray-100">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Skor KPI Final</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn(
                                "text-6xl font-bold",
                                totalWeight === 100 ? "text-primary" : "text-muted-foreground"
                            )}>
                                {totalWeight === 100 ? totalScore : "-"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">dari 100</p>
                        </CardContent>
                    </Card>
                     <Card className={cn(
                        "w-full text-center transition-colors print:hidden",
                        totalWeight !== 100 ? "bg-destructive/10 border-destructive text-destructive-foreground" : ""
                     )}>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Total Bobot</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn("text-4xl font-bold", totalWeight !== 100 && "text-destructive")}>
                                {totalWeight}%
                            </p>
                             {totalWeight !== 100 && (
                                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Total bobot harus 100%</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="mt-8 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="supervisor-notes">Catatan Supervisor</Label>
                        <Textarea id="supervisor-notes" rows={4} readOnly value={supervisorNotes} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hrd-notes">Catatan Tambahan dari HRD</Label>
                        <Textarea id="hrd-notes" placeholder="Tambahkan catatan atau feedback Anda di sini..." rows={4} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between pt-6 border-t mt-6 flex-col items-start gap-4 print:flex">
                 <div className="w-full space-y-6">
                    <h3 className="font-headline font-semibold">Tanda Tangan</h3>
                    <div className="grid grid-cols-3 gap-8 text-center text-sm">
                        <div className="flex flex-col justify-between h-32">
                            <p>Karyawan</p>
                            <p className="border-t pt-2 mt-auto border-gray-400">{employee.name}</p>
                        </div>
                        <div className="flex flex-col justify-between h-32">
                            <p>Supervisor</p>
                            <p className="border-t pt-2 mt-auto border-gray-400">{db.employees.find(e => e.id === employee.supervisorId)?.name || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col justify-between h-32">
                            <p>HRD</p>
                             <p className="border-t pt-2 mt-auto border-gray-400">Amanda Lee</p>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}

    