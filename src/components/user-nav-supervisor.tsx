
"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check, LogOut, Settings, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { getDb, updateDb } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const currentSupervisorId = "E002";

export function UserNavSupervisor() {
    const { toast } = useToast();
    const [db, setDb] = React.useState(getDb());

    const myTeamIds = db.employees.filter(e => e.supervisorId === currentSupervisorId).map(e => e.id);
    const teamLeaveRequests = db.leaveRequests.filter(req => myTeamIds.includes(req.employeeId) && req.status === "Tertunda");
    
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
            title: `Permintaan ${newStatus === 'Ditolak' ? 'Ditolak' : 'Diteruskan'}`,
            description: `Permintaan cuti telah berhasil diproses.`,
        });
    }


  return (
    <div className="flex items-center gap-4">
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {teamLeaveRequests.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0">{teamLeaveRequests.length}</Badge>
                    )}
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4">
                    <h4 className="font-medium text-sm">Permintaan Cuti Tim</h4>
                </div>
                 <div className="space-y-2 p-4 pt-0">
                     {teamLeaveRequests.length > 0 ? teamLeaveRequests.map((req) => (
                        <div key={req.id} className="space-y-2 rounded-md border p-3">
                            <div>
                                <p className="text-sm font-medium">{getEmployeeName(req.employeeId)}</p>
                                <p className="text-xs text-muted-foreground">{req.type}</p>
                            </div>
                            <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
                            <div className="flex justify-end gap-2 pt-1">
                                <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleLeaveApproval(req.id, "Menunggu Persetujuan HRD")}>
                                    <Check className="mr-1 h-3 w-3"/> Setujui
                                </Button>
                                 <Button variant="destructive" size="sm" className="h-7 px-2" onClick={() => handleLeaveApproval(req.id, "Ditolak")}>
                                    <X className="mr-1 h-3 w-3"/> Tolak
                                </Button>
                            </div>
                        </div>
                     )) : (
                        <p className="text-sm text-muted-foreground text-center pb-4">Tidak ada notifikasi baru.</p>
                     )}
                 </div>
            </PopoverContent>
        </Popover>

        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/32x32.png" alt="Supervisor avatar" data-ai-hint="user avatar" />
                <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jane Smith</p>
                <p className="text-xs leading-none text-muted-foreground">
                jane.smith@example.com
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href="/supervisor/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan Akun</span>
                </Link>
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
            <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
            </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
