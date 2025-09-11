'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Settings,
  Spade,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/', label: 'Práctica', icon: BrainCircuit },
  { href: '/dashboard', label: 'Estadísticas', icon: BarChart3 },
  { href: '/learn', label: 'Aprender', icon: BookOpen },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Spade className="text-primary" />
            </Button>
            <h1 className="font-headline text-lg font-semibold">
              Preflop Pro
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
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
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/poker-user/40/40" data-ai-hint="profile avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-semibold">Usuario</span>
              <span className="text-muted-foreground">Novato</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/50 px-4 backdrop-blur-sm md:px-6">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-xl font-headline font-semibold">
                {menuItems.find(item => item.href === pathname)?.label || 'Preflop Pro Trainer'}
            </h2>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
