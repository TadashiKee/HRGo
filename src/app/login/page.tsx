
"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState("owner");
  const { toast } = useToast();

  const handleLogin = () => {
    if (role === "owner") {
      router.push("/dashboard");
    } else if (role === "hrd") {
      router.push("/hrd/dashboard");
    } else if (role === "supervisor") {
      router.push("/supervisor/dashboard");
    } else {
      router.push("/staff/dashboard");
    }
  };
  
  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast({
        title: "Tautan Reset Terkirim!",
        description: "Silakan periksa email Anda untuk instruksi pengaturan ulang kata sandi."
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
         <Logo />
       </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Masuk</CardTitle>
          <CardDescription>
            Pilih jabatan dan masukan username dan password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label>Jabatan</Label>
                <RadioGroup defaultValue="owner" className="grid grid-cols-2 gap-4" onValueChange={setRole}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="staff" id="r1" />
                        <Label htmlFor="r1">Staff</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hrd" id="r2" />
                        <Label htmlFor="r2">HRD</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="supervisor" id="r3" />
                        <Label htmlFor="r3">Supervisor</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="owner" id="r4" />
                        <Label htmlFor="r4">Owner</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="owner@theemployee.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Kata Sandi</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                  onClick={handleForgotPassword}
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="123456789password" />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              Masuk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
