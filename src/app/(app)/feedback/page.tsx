
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Send, Lightbulb, Sparkles, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getDb, updateDb, Feedback } from "@/lib/data"
import { summarizeFeedback } from "@/ai/flows/summarize-feedback-flow"

const feedbackFormSchema = z.object({
  feedback: z.string().min(10, { message: "Masukan harus minimal 10 karakter." }).max(1000, { message: "Masukan tidak boleh lebih dari 1000 karakter." }),
})

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>

export default function OwnerFeedbackPage() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());
    const [isLoadingSummary, setIsLoadingSummary] = React.useState(false);
    const [summary, setSummary] = React.useState<string | null>(null);

    const feedbackData = db.feedbackData.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            feedback: ""
        }
    })

    async function handleGenerateSummary() {
        setIsLoadingSummary(true);
        setSummary(null);
        try {
            const feedbackContent = feedbackData.map(f => f.content);
            const result = await summarizeFeedback(feedbackContent);
            setSummary(result);
        } catch (error) {
            console.error("Error generating summary:", error);
            toast({
                variant: "destructive",
                title: "Gagal Membuat Ringkasan",
                description: "Terjadi kesalahan saat mencoba membuat ringkasan. Silakan coba lagi.",
            });
        } finally {
            setIsLoadingSummary(false);
        }
    }

    function onSubmit(data: FeedbackFormValues) {
        const newFeedback: Feedback = {
            id: Date.now(),
            content: data.feedback,
            timestamp: new Date(),
        };
        const newDb = { ...db, feedbackData: [...db.feedbackData, newFeedback] };
        updateDb(newDb);
        setDb(getDb());

        toast({
            title: "Masukan Terkirim!",
            description: "Terima kasih atas saran Anda. Kami sangat menghargainya.",
        })
        form.reset();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Saran & Masukan Karyawan</h1>
            
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline">Ringkasan Cerdas</CardTitle>
                            <CardDescription>Gunakan AI untuk menganalisis dan merangkum semua masukan.</CardDescription>
                        </div>
                        <Button onClick={handleGenerateSummary} disabled={isLoadingSummary || feedbackData.length < 3}>
                            {isLoadingSummary ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Buat Ringkasan
                        </Button>
                    </CardHeader>
                    {(isLoadingSummary || summary) && (
                        <CardContent>
                            {isLoadingSummary && (
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                                </div>
                            )}
                            {summary && (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>Hasil Analisis AI</AlertTitle>
                                    <AlertDescription className="whitespace-pre-wrap">
                                        {summary}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    )}
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Semua Masukan</CardTitle>
                        <CardDescription>Daftar semua masukan anonim yang diterima dari karyawan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {feedbackData.length > 0 ? (
                            <ul className="space-y-4">
                                {feedbackData.map((item) => (
                                    <li key={item.id} className="rounded-lg border p-4">
                                        <p className="text-sm text-muted-foreground italic">"{item.content}"</p>
                                        <p className="text-xs text-muted-foreground text-right mt-3">
                                            Diterima pada {format(item.timestamp, "d LLLL yyyy, HH:mm", { locale: id })}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground">
                                <p>Belum ada masukan yang diterima.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
