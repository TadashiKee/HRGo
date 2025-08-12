
"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { EmployeeCard } from "@/components/employee-card"
import { getDb, updateDb, Employee } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function HrdEmployeesPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [db, setDb] = React.useState(getDb());
    const { toast } = useToast();
    
    const employees = db.employees.filter(e => e.role !== 'owner');

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id' | 'avatar' | 'status'>) => {
        const newEmployee: Employee = {
            ...newEmployeeData,
            id: `E${(db.employees.length + 1).toString().padStart(3, '0')}`,
            avatar: "https://placehold.co/96x96.png",
            status: "Aktif",
        }
        
        const newDb = { ...db, employees: [...db.employees, newEmployee] };
        updateDb(newDb);
        setDb(getDb());
    }

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        const newEmployees = db.employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
        updateDb({ ...db, employees: newEmployees });
        setDb(getDb());
        toast({
            title: "Data Karyawan Diperbarui",
            description: `Informasi untuk ${updatedEmployee.name} telah berhasil disimpan.`,
        });
    };

    const handleDeleteEmployee = (employeeId: string) => {
        const newEmployees = db.employees.filter(emp => emp.id !== employeeId);
        updateDb({ ...db, employees: newEmployees });
        setDb(getDb());
        toast({
            title: "Karyawan Dihapus",
            description: "Data karyawan telah berhasil dihapus dari sistem.",
            variant: "destructive"
        });
    };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Kelola Karyawan</h1>
                <p className="text-muted-foreground">Cari, lihat, dan kelola data seluruh karyawan perusahaan.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
                 <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari karyawan..."
                        className="pl-8 sm:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <AddEmployeeDialog onEmployeeAdd={handleAddEmployee}>
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2">
                        <Plus className="h-4 w-4"/>
                        <span className="hidden sm:inline">Tambah Karyawan</span>
                    </button>
                </AddEmployeeDialog>
            </div>
        </div>

      {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee}
                onUpdate={handleUpdateEmployee}
                onDelete={handleDeleteEmployee}
              />
            ))}
          </div>
      ) : (
         <div className="text-center py-16 text-muted-foreground">
            <p>Tidak ada karyawan yang cocok dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  )
}
