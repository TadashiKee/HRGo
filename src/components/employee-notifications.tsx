
"use client"

import { differenceInDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { Cake, FileClock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Employee } from "@/lib/data";

interface EmployeeNotificationsProps {
  employee: Employee;
}

export function EmployeeNotifications({ employee }: EmployeeNotificationsProps) {
  const today = new Date();
  const notifications: React.ReactNode[] = [];

  // Birthday check (ignoring the year by comparing month and day directly)
  const isBirthday =
    today.getMonth() === employee.dateOfBirth.getMonth() &&
    today.getDate() === employee.dateOfBirth.getDate();

  if (isBirthday) {
    notifications.push(
      <Alert key="birthday">
        <Cake className="h-4 w-4" />
        <AlertTitle>Selamat Ulang Tahun!</AlertTitle>
        <AlertDescription>
          Semoga panjang umur, sehat selalu, dan semakin sukses. Nikmati hari spesial Anda!
        </AlertDescription>
      </Alert>
    );
  }

  // Contract expiration check (within 30 days)
  const daysUntilExpiry = differenceInDays(employee.contractEndDate, today);
  if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
    notifications.push(
      <Alert key="contract" variant="destructive">
        <FileClock className="h-4 w-4" />
        <AlertTitle>Pengingat: Kontrak Akan Berakhir</AlertTitle>
        <AlertDescription>
          Kontrak kerja Anda akan berakhir pada <strong>{format(employee.contractEndDate, "d MMMM yyyy", { locale: id })}</strong> ({daysUntilExpiry} hari lagi). Harap hubungi HRD untuk informasi lebih lanjut.
        </AlertDescription>
      </Alert>
    );
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {notifications}
    </div>
  );
}
