
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { getDb } from "@/lib/data"

const addEmployeeSchema = z.object({
  name: z.string().min(3, { message: "Nama harus minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  department: z.string({ required_error: "Departemen wajib dipilih." }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon tidak valid." }),
  gender: z.string({ required_error: "Jenis kelamin wajib dipilih." }),
  dateOfBirth: z.date({ required_error: "Tanggal lahir wajib diisi." }),
  hireDate: z.date({ required_error: "Tanggal masuk wajib diisi." }),
  leaveBalance: z.coerce.number().min(0, { message: "Sisa cuti tidak boleh negatif." }),
  contractStartDate: z.date({ required_error: "Tanggal mulai kontrak wajib diisi." }),
  contractEndDate: z.date({ required_error: "Tanggal akhir kontrak wajib diisi." }),
  role: z.string({ required_error: "Peran wajib dipilih." }),
  supervisorId: z.string().optional(),
})

type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>

interface AddEmployeeDialogProps {
    children: React.ReactNode;
    onEmployeeAdd: (data: AddEmployeeFormValues) => void;
}

export function AddEmployeeDialog({ children, onEmployeeAdd }: AddEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast();
  const db = getDb();
  const supervisors = db.employees.filter(e => e.role === 'supervisor');

  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      department: undefined,
      phoneNumber: "",
      gender: undefined,
      leaveBalance: 12,
      role: undefined,
      supervisorId: undefined,
    },
  })

  function onSubmit(data: AddEmployeeFormValues) {
    onEmployeeAdd(data);
    toast({
        title: "Karyawan Ditambahkan!",
        description: `${data.name} telah berhasil ditambahkan ke sistem. Password awal telah dikirim ke email mereka.`,
    })
    setOpen(false)
    form.reset()
  }

  const selectedRole = form.watch('role');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle className="font-headline">Tambah Karyawan Baru</DialogTitle>
                    <DialogDescription>
                        Isi detail di bawah ini untuk menambahkan karyawan baru ke dalam sistem.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Contoh: john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departemen</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih departemen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Teknik">Teknik</SelectItem>
                                        <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                                        <SelectItem value="SDM & Umum">SDM & Umum</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Peran / Jabatan</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih peran" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="hrd">HRD</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     {selectedRole === 'staff' && (
                         <FormField
                            control={form.control}
                            name="supervisorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Atasan / Supervisor</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih atasan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {supervisors.map(spv => (
                                                <SelectItem key={spv.id} value={spv.id}>{spv.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. WhatsApp</FormLabel>
                                <FormControl>
                                    <Input placeholder="0812..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Kelamin</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Lahir</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? (format(field.value, "PPP", {locale: id})) : (<span>Pilih tanggal</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hireDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Masuk</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? (format(field.value, "PPP", {locale: id})) : (<span>Pilih tanggal</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contractStartDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Mulai Kontrak</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? (format(field.value, "PPP", {locale: id})) : (<span>Pilih tanggal</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contractEndDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Akhir Kontrak</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? (format(field.value, "PPP", {locale: id})) : (<span>Pilih tanggal</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="leaveBalance"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Sisa Cuti Tahunan</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Contoh: 12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                    <Button type="submit">Simpan</Button>
                </DialogFooter>
            </form>
         </Form>
      </DialogContent>
    </Dialog>
  )
}
