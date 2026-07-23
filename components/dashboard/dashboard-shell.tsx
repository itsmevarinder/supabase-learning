"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, CircleHelp, GalleryHorizontal, Info, LayoutDashboard, LogIn, LogOut, Mail, MessageSquareQuote, Settings, Image as ImageIcon, Tag, User, Users, Video } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";

// Nav items (including icon components) must live here, inside the Client
// Component — icon components are function references, and Server Components
// can only pass plain serializable data as props to Client Components. Layouts
// pass a plain `variant` string instead and this file resolves the icons itself.
const SECTIONS = {
  admin: {
    navItems: [
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/hero-banners", label: "Hero Banners", icon: GalleryHorizontal },
      { href: "/admin/about", label: "About", icon: Info },
      { href: "/admin/video", label: "Video", icon: Video },
      { href: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
      { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
      { href: "/admin/pricing", label: "Pricing", icon: Tag },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/contact-submissions", label: "Messages", icon: Mail },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  user: {
    navItems: [
      { href: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/user/profile", label: "Profile", icon: User },
      { href: "/user/settings", label: "Settings", icon: Settings },
    ],
  },
} as const;

interface DashboardShellProps {
  variant: keyof typeof SECTIONS;
  roleLabel: string;
  userEmail: string;
  userName: string;
  children: ReactNode;
  // Only passed by the admin layout — lets an admin flip the public site
  // header's Login button on/off without leaving the dashboard.
  showLoginButton?: boolean;
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Active for the exact route AND any nested route beneath it (e.g.
// "/admin/portfolio/add-project" should still highlight "Portfolio") — not
// just an exact pathname match.
function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  variant,
  roleLabel,
  userEmail,
  userName,
  children,
  showLoginButton,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { navItems } = SECTIONS[variant];
  const activeItem = navItems.find((item) => isNavItemActive(pathname, item.href));
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loginButtonVisible, setLoginButtonVisible] = useState(showLoginButton ?? true);
  const [savingLoginToggle, setSavingLoginToggle] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleLoginToggle(checked: boolean) {
    setLoginButtonVisible(checked);
    setSavingLoginToggle(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ show_login_button: checked })
      .eq("id", 1);

    setSavingLoginToggle(false);
    if (error) {
      setLoginButtonVisible(!checked);
      return;
    }
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="" className="w-12 animate-spin-linear" />
                <span className="truncate text-3xl font-semibold">Aurora</span>
              </Link>} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.label}
                      render={
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initialsFor(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="grid text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to log back in to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-full" />
          <span className="text-sm font-medium">{activeItem?.label ?? "Dashboard"}</span>

          {showLoginButton !== undefined && (
            <div className="ml-auto flex items-center gap-2">
              <LogIn className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Login button</span>
              <Switch
                checked={loginButtonVisible}
                onCheckedChange={handleLoginToggle}
                disabled={savingLoginToggle}
              />
            </div>
          )}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
