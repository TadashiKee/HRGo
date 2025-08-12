
"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Edit2, Trash2, KeyRound } from "lucide-react"
import { Employee, getDb } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

interface EmployeeDetailsDialogProps {
  employee: Employee
  children: React.ReactNode
  onUpdate: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export function EmployeeDetailsDialog({ employee, children, onUpdate, onDelete }: EmployeeDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedEmployee, setEditedEmployee] = React.useState<Employee>(employee);
  const { toast } = useToast();
  const db = getDb();
  const supervisors = db.employees.filter(e => e.role === 'supervisor' && e.id !== employee.id);
  const supervisorName = db.employees.find(e => e.id === employee.supervisorId)?.name;


  const handleResetPassword = () => {
    toast({
        title: "Tautan Reset Terkirim!",
        description: `Tautan untuk mengatur ulang kata sandi telah dikirim ke email ${employee.name}.`
    })
  }
  
  const handleSave = () => {
    onUpdate(editedEmployee);
    setIsEditing(false);
  }

  const handleDelete = () => {
    onDelete(employee.id);
    setOpen(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setIsEditing(false);
      setEditedEmployee(employee); // Reset changes on close
    }
  }

  const handleChange = (field: keyof Employee, value: any) => {
    setEditedEmployee(prev => ({...prev, [field]: value}));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="items-center text-center">
            <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="user avatar" />
                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <DialogTitle className="font-headline text-2xl pt-2">{employee.name}</DialogTitle>
            <DialogDescription>ID Karyawan: {employee.id}</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-4 max-h-[60vh] overflow-y-auto pr-6">
             <div className="space-y-2">
                <Label>Departemen</Label>
                {isEditing ? (
                    <Select value={editedEmployee.department} onValueChange={(value) => handleChange('department', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Teknik">Teknik</SelectItem>
                            <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                            <SelectItem value="SDM & Umum">SDM & Umum</SelectItem>
                        </SelectContent>
                    </Select>
                ) : <p className="text-sm">{employee.department}</p>}
            </div>
             <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? <Input type="email" value={editedEmployee.email} onChange={(e) => handleChange('email', e.target.value)} /> : <p className="text-sm">{employee.email}</p>}
            </div>
             <div className="space-y-2">
                <Label>Nomor WhatsApp</Label>
                {isEditing ? <Input value={editedEmployee.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} /> : <p className="text-sm">{employee.phoneNumber}</p>}
            </div>
             <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <p className="text-sm">{format(employee.dateOfBirth, "d LLLL yyyy", { locale: id })}</p>
            </div>
             <div className="space-y-2">
                <Label>Tanggal Masuk</Label>
                <p className="text-sm">{format(employee.hireDate, "d LLLL yyyy", { locale: id })}</p>
            </div>
             <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                 {isEditing ? (
                    <Select value={editedEmployee.gender} onValueChange={(value) => handleChange('gender', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                ) : <p className="text-sm">{employee.gender}</p>}
            </div>
             <div className="space-y-2">
                <Label>Status</Label>
                 {isEditing ? (
                    <Select value={editedEmployee.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Cuti">Cuti</SelectItem>
                            <SelectItem value="Resign">Resign</SelectItem>
                        </SelectContent>
                    </Select>
                ) : <Badge variant={employee.status === 'Aktif' ? 'default' : 'secondary'} className="w-fit">{employee.status}</Badge>}
            </div>
             <div className="space-y-2">
                <Label>Peran</Label>
                 {isEditing ? (
                    <Select value={editedEmployee.role} onValueChange={(value) => handleChange('role', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="hrd">HRD</SelectItem>
                        </SelectContent>
                    </Select>
                ) : <p className="text-sm capitalize">{employee.role}</p>}
            </div>
            {employee.role === 'staff' && (
                <div className="space-y-2">
                    <Label>Atasan / Supervisor</Label>
                    {isEditing ? (
                        <Select value={editedEmployee.supervisorId} onValueChange={(value) => handleChange('supervisorId', value)}>
                            <SelectTrigger><SelectValue placeholder="Pilih atasan" /></SelectTrigger>
                            <SelectContent>
                                {supervisors.map(spv => (
                                    <SelectItem key={spv.id} value={spv.id}>{spv.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : <p className="text-sm">{supervisorName || "Belum diatur"}</p>}
                </div>
            )}
            <div className="space-y-2">
                <Label>Tanggal Mulai Kontrak</Label>
                <p className="text-sm">{format(employee.contractStartDate, "d LLLL yyyy", { locale: id })}</p>
            </div>
            <div className="space-y-2">
                <Label>Tanggal Akhir Kontrak</Label>
                <p className="text-sm">{format(employee.contractEndDate, "d LLLL yyyy", { locale: id })}</p>
            </div>
             <div className="space-y-2 col-span-2">
                <Label>Sisa Cuti Tahunan</Label>
                {isEditing ? <Input type="number" value={editedEmployee.leaveBalance} onChange={(e) => handleChange('leaveBalance', Number(e.target.value))} /> : <p className="text-sm font-semibold">{employee.leaveBalance} hari</p>}
            </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row-reverse sm:flex-row-reverse border-t pt-4">
          <div className="flex gap-2">
            {isEditing ? (
              <Button onClick={handleSave}>Simpan Perubahan</Button>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin menghapus karyawan ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data karyawan secara permanen dari sistem.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
           <div className="flex gap-2">
            {isEditing ? (
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
             ) : (
                <Button variant="outline" onClick={handleResetPassword}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                </Button>
             )}
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
