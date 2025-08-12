
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Settings,
  ClipboardCheck,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/user-profile";
import { ThemeSwitcher } from "@/components/theme-switcher";

const ownerMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/approvals", label: "Persetujuan", icon: ClipboardCheck },
    { href: "/feedback", label: "Saran & Masukan", icon: MessageSquare },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <UserProfile />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
            <SidebarGroupLabel>Menu Owner</SidebarGroupLabel>
            <SidebarMenu>
                {ownerMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                    <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton
                    isActive={pathname === "/settings"}
                    tooltip={{ children: "Pengaturan" }}
                  >
                    <Settings />
                    <span>Pengaturan</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/login">
                  <SidebarMenuButton
                    tooltip={{ children: "Keluar" }}
                  >
                    <LogOut />
                    <span>Keluar</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
