
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmployeeDetailsDialog } from "./employee-details-dialog"
import type { Employee } from "@/lib/data"

interface EmployeeCardProps {
  employee: Employee;
  onUpdate: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export function EmployeeCard({ employee, onUpdate, onDelete }: EmployeeCardProps) {
  return (
    <EmployeeDetailsDialog employee={employee} onUpdate={onUpdate} onDelete={onDelete}>
        <Card className="group cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg">
            <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Badge variant={employee.status === 'Aktif' ? 'default' : 'secondary'}>{employee.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <h3 className="font-headline font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{employee.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{employee.department}</p>
            </CardContent>
        </Card>
    </EmployeeDetailsDialog>
  )
}
