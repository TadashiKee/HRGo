
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Send, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getDb, updateDb, Feedback } from "@/lib/data"

const feedbackFormSchema = z.object({
  feedback: z.string().min(10, { message: "Masukan harus minimal 10 karakter." }).max(1000, { message: "Masukan tidak boleh lebih dari 1000 karakter." }),
})

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>

export default function SupervisorFeedbackPage() {
    const { toast } = useToast();
    const db = getDb();

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            feedback: ""
        }
    })

    function onSubmit(data: FeedbackFormValues) {
        const newFeedback: Feedback = {
            id: Date.now(),
            content: data.feedback,
            timestamp: new Date(),
        };
        const newDb = { ...db, feedbackData: [...db.feedbackData, newFeedback] };
        updateDb(newDb);
        
        toast({
            title: "Masukan Terkirim!",
            description: "Terima kasih atas saran Anda. Kami sangat menghargainya.",
        })
        form.reset();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">Beri Masukan</h1>
            <div className="mx-auto max-w-2xl">
                <Card>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle className="font-headline">Formulir Saran & Masukan</CardTitle>
                                <CardDescription>Punya ide untuk meningkatkan perusahaan? Beri tahu kami di sini.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert>
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertTitle>Masukan Anda Anonim</AlertTitle>
                                    <AlertDescription>
                                        Semua masukan yang dikirim melalui formulir ini bersifat anonim untuk mendorong kejujuran dan keterbukaan.
                                    </AlertDescription>
                                </Alert>
                                <FormField
                                    control={form.control}
                                    name="feedback"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saran atau Masukan Anda</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tuliskan ide, saran, atau keluhan Anda di sini..."
                                                    className="resize-y"
                                                    rows={8}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Masukan
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    )
}
