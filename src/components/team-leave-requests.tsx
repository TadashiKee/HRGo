
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, User, CalendarDays } from "lucide-react"

const teamLeaveRequests = [
  { id: 1, employee: "Alice Johnson", type: "Cuti Tahunan", dates: "12 Agu - 15 Agu", reason: "Liburan keluarga." },
  { id: 2, employee: "David Smith", type: "Cuti Sakit", dates: "5 Agu", reason: "Sakit demam dan perlu istirahat." },
]

export function TeamLeaveRequests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Permintaan Cuti Tim</CardTitle>
        <CardDescription>Tinjau dan proses permintaan cuti dari anggota tim Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {teamLeaveRequests.length > 0 ? (
          <ul className="space-y-4">
            {teamLeaveRequests.map((req) => (
              <li key={req.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div>
                        <p className="font-semibold">{req.employee}</p>
                        <p className="text-sm text-muted-foreground">{req.type}</p>
                    </div>
                     <div className="text-sm text-muted-foreground text-right">
                        <p>{req.dates}</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">"{req.reason}"</p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Check className="mr-2 h-4 w-4" />
                    Setujui
                  </Button>
                  <Button variant="destructive" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>Tidak ada permintaan cuti yang tertunda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
