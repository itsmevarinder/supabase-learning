"use client";

import { useState, type ReactNode } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronsUpDown, CircleHelp, GalleryHorizontal, Heart, Images, Info, LayoutDashboard, Layers, LogIn, LogOut, Mail, MessageSquareQuote, Music, Settings, Image as ImageIcon, Video } from "lucide-react";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/hero-banners", label: "Hero Banners", icon: GalleryHorizontal },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
  { href: "/admin/donate", label: "Donate", icon: Heart },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/contact-submissions", label: "Messages", icon: Mail },
] as const;

const MEDIA_NAV_ITEMS = [
  { href: "/admin/video", label: "Video", icon: Video },
  { href: "/admin/audio", label: "Audio", icon: Music },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
] as const;

interface DashboardShellProps {
  roleLabel: string;
  userEmail: string;
  userName: string;
  children: ReactNode;
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


function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  roleLabel,
  userEmail,
  userName,
  children,
  showLoginButton,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem =
    NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)) ??
    MEDIA_NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loginButtonVisible, setLoginButtonVisible] = useState(showLoginButton ?? true);
  const [savingLoginToggle, setSavingLoginToggle] = useState(false);
  const mediaActive = MEDIA_NAV_ITEMS.some((item) => isNavItemActive(pathname, item.href));
  // Starts open when first landing on a media route, but afterwards the
  // user's own toggle always wins — previously `mediaToggled || mediaActive`
  // meant the dropdown could never be collapsed while its route was active.
  const [mediaOpen, setMediaOpen] = useState(mediaActive);

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
                <NextImage src="/logo.png" alt="" width={48} height={48} priority className="w-12 animate-spin-linear" />
                <span className="truncate text-3xl font-semibold">CMS</span>
              </Link>} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.slice(0, 3).map((item) => (
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

                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Manage Media and Events"
                    isActive={mediaActive}
                    onClick={() => setMediaOpen((open) => !open)}
                    aria-expanded={mediaOpen}
                  >
                    <Layers />
                    <span>Manage Media and Events</span>
                    <ChevronDown
                      className={`ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${mediaOpen ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>

                  <div
                    className={`grid overflow-hidden transition-all duration-200 ease-out ${mediaOpen ? "pt-3" : "pt-0"
                      }`}
                    style={{ gridTemplateRows: mediaOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <SidebarMenuSub className="py-3">
                        {MEDIA_NAV_ITEMS.map((item) => (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              isActive={isNavItemActive(pathname, item.href)}
                              render={
                                <Link href={item.href} className="h-8.5">
                                  <item.icon />
                                  <span>{item.label}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </div>
                  </div>
                </SidebarMenuItem>

                {NAV_ITEMS.slice(3).map((item) => (
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
              <DropdownMenuItem render={<Link href="/admin/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
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
        <header className="flex h-14 shrink-0 overflow-hidden bg-card rounded-tl-md rounded-tr-md items-center relative gap-4 border-b border-border px-4">
          <span className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--chart-2),transparent_80%)] blur-3xl" />
          <SidebarTrigger />
          <span className="text-base font-semibold">{activeItem?.label ?? "Dashboard"}</span>

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
