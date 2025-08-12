
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
import { Send, ArrowLeft, Plus, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notFound, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDb, updateDb, KpiAssessment } from "@/lib/data"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface Metric {
  id: string
  name: string
  weight: number
  score: number
}

const initialMetrics: Metric[] = [
  { id: `metric-${Date.now()}`, name: "Kualitas Kerja", weight: 40, score: 75 },
  { id: `metric-${Date.now() + 1}`, name: "Ketepatan Waktu", weight: 30, score: 75 },
  { id: `metric-${Date.now() + 2}`, name: "Komunikasi", weight: 30, score: 75 },
]

export default function KpiAssessmentPage() {
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const employeeId = params.employeeId as string

  const db = getDb();
  const employee = React.useMemo(() => db.employees.find(e => e.id === employeeId), [employeeId, db.employees]);
  
  const [metrics, setMetrics] = React.useState<Metric[]>(initialMetrics)
  const [notes, setNotes] = React.useState("")
  const [totalScore, setTotalScore] = React.useState(0)
  const [totalWeight, setTotalWeight] = React.useState(0)

  const handleMetricChange = (id: string, field: keyof Metric, value: string | number) => {
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    )
  }

  const addMetric = () => {
    const newMetric: Metric = {
      id: `metric-${Date.now()}`,
      name: "",
      weight: 0,
      score: 75,
    }
    setMetrics(prev => [...prev, newMetric])
  }

  const removeMetric = (id: string) => {
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

    const newAssessment: KpiAssessment = {
        employeeId: employee.id,
        metrics: metrics.map(({ id, ...rest }) => rest), // remove temporary id
        notes: notes,
    };

    // Remove existing assessment for this employee if it exists, then add the new one
    const otherAssessments = db.kpiAssessments.filter(a => a.employeeId !== employee.id);
    updateDb({ kpiAssessments: [...otherAssessments, newAssessment] });

    toast({
        title: "Penilaian Terkirim!",
        description: `Penilaian KPI untuk ${employee.name} telah berhasil dikirim ke HRD.`
    })
    
    router.push("/supervisor/kpi");
  }

  if (!employee) {
    return notFound();
  }

  return (
    <div className="space-y-6">
       <div>
            <Button variant="outline" asChild>
                <Link href="/supervisor/kpi">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Karyawan
                </Link>
            </Button>
       </div>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 border">
                        <AvatarImage src={employee.avatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-2xl">Formulir Penilaian Kinerja</CardTitle>
                        <CardDescription>{employee.name} - {employee.role}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        {metrics.map((metric) => (
                            <div key={metric.id} className="space-y-3 p-4 border rounded-lg relative">
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                        <Label htmlFor={`name-${metric.id}`}>Nama Metrik</Label>
                                        <Input
                                            id={`name-${metric.id}`}
                                            value={metric.name}
                                            onChange={(e) => handleMetricChange(metric.id, 'name', e.target.value)}
                                            placeholder={`Contoh: Kualitas Kerja`}
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
                                        />
                                        <span className="w-12 text-center text-lg font-bold text-primary">{metric.score}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeMetric(metric.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addMetric} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Metrik Penilaian
                        </Button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Card className="w-full max-w-xs text-center bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg">Skor KPI Total</CardTitle>
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
                                "w-full max-w-xs text-center transition-colors",
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
                        <div className="space-y-2">
                            <Label htmlFor="supervisor-notes">Catatan / Feedback untuk HRD</Label>
                            <Textarea 
                                id="supervisor-notes" 
                                placeholder="Tuliskan catatan Anda di sini..." 
                                rows={5} 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end pt-6 border-t mt-4">
                <Button onClick={handleSubmit} disabled={totalWeight !== 100}>
                    <Send className="mr-2 h-4 w-4" />
                    Simpan & Kirim ke HRD
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}

    