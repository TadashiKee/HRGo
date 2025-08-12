
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';

interface UserProfileProps {
    isStaff?: boolean;
}

export function UserProfile({ isStaff = false }: UserProfileProps) {
    const pathname = usePathname();

    let name = "John Doe";
    let role = "Staff";

    if (pathname.startsWith('/staff')) {
        name = "John Doe";
        role = "Staff";
    } else if (pathname.startsWith('/supervisor')) {
        name = "Jane Smith";
        role = "Supervisor";
    } else if (pathname.startsWith('/hrd')) {
        name = "Amanda Lee";
        role = "HRD";
    } else {
        name = "Owner";
        role = "Owner";
    }


    return (
        <div className="flex items-center gap-3 p-2">
            <Avatar className="h-12 w-12">
                <AvatarImage src="https://placehold.co/100x100.png" alt={name} data-ai-hint="user avatar" />
                <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <p className="text-base font-semibold font-headline text-sidebar-foreground">{name}</p>
                <p className="text-sm text-sidebar-foreground/80">{role}</p>
            </div>
        </div>
    )
}
