
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import React from "react";

export default function SettingsPage() {
    const [avatar, setAvatar] = React.useState("https://placehold.co/96x96.png");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

     const handleSaveChanges = () => {
        toast({
            title: "Perubahan Disimpan!",
            description: "Informasi profil Anda telah berhasil diperbarui.",
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Profil & Pengaturan</h1>
                <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center pt-8">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatar} alt="Amanda Lee" data-ai-hint="user avatar" />
                                    <AvatarFallback>AL</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-4 w-4" />
                                    <span className="sr-only">Ubah Foto Profil</span>
                                </Button>
                                <Input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-xl font-semibold font-headline">Amanda Lee</p>
                            <p className="text-muted-foreground">HRD</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Informasi Akun</CardTitle>
                            <CardDescription>Kelola detail akun Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nama Depan</Label>
                                    <Input id="firstName" defaultValue="Amanda" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nama Belakang</Label>
                                    <Input id="lastName" defaultValue="Lee" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input id="email" type="email" defaultValue="amanda.lee@hrgo.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Ganti Kata Sandi</Label>
                                <Input id="password" type="password" placeholder="••••••••" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
