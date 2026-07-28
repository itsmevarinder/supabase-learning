"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronsUpDown, CircleHelp, ExternalLink, GalleryHorizontal, Heart, Images, Info, LayoutDashboard, Layers, LogIn, LogOut, Mail, MessageSquareQuote, Music, Rss, Settings, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuArrow,
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
  useSidebar,
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
  { href: "/admin/newsletter", label: "Newsletter", icon: Rss },
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
  userAvatarUrl?: string;
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

function NavLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const { setOpenMobile } = useSidebar();
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        setTimeout(() => setOpenMobile(false), 500);
      }}
      {...props}
    />
  );
}

function MediaNavItem({ pathname }: { pathname: string }) {
  const { state, isMobile } = useSidebar();
  const mediaActive = MEDIA_NAV_ITEMS.some((item) => isNavItemActive(pathname, item.href));
  const [mediaOpen, setMediaOpen] = useState(mediaActive);

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton tooltip="Manage Media and Events" isActive={mediaActive}>
                <Layers />
                <span>Manage Media and Events</span>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side="right" align="center" sideOffset={8} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Manage Media and Events</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {MEDIA_NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <DropdownMenuItem
                    key={item.href}
                    render={<NavLink href={item.href} />}
                    className={`gap-2.5 py-1.5 ${active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}`}
                  >
                    <item.icon />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
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
        className={`grid overflow-hidden transition-all duration-200 ease-out ${mediaOpen ? "pt-3" : "pt-0"}`}
        style={{ gridTemplateRows: mediaOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <SidebarMenuSub className="py-3">
            {MEDIA_NAV_ITEMS.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  isActive={isNavItemActive(pathname, item.href)}
                  render={
                    <NavLink href={item.href} className="h-8.5">
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  }
                />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

export function DashboardShell({
  roleLabel,
  userEmail,
  userName,
  userAvatarUrl,
  children,
  showLoginButton,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const settingsActive = isNavItemActive(pathname, "/admin/settings");
  const activeItem =
    NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)) ??
    MEDIA_NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)) ??
    (settingsActive ? { label: "Settings" } : undefined);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loginButtonVisible, setLoginButtonVisible] = useState(showLoginButton ?? true);
  const [savingLoginToggle, setSavingLoginToggle] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed out.");
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
      toast.error(error.message);
      return;
    }

    toast.success(checked ? "Login button shown." : "Login button hidden.");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/admin/dashboard" className="flex items-center gap-3">
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
                        <NavLink href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
                      }
                    />
                  </SidebarMenuItem>
                ))}

                <MediaNavItem pathname={pathname} />

                {NAV_ITEMS.slice(3).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.label}
                      render={
                        <NavLink href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
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
                  <Avatar className="size-10 rounded-lg">
                    <AvatarImage src={userAvatarUrl || undefined} alt="" />
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
              <DropdownMenuItem
                render={<NavLink href="/admin/settings" />}
                className={settingsActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
              >
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
        <header className="sticky top-0 z-30 flex h-14 shrink-0 overflow-hidden bg-card rounded-tl-md rounded-tr-md items-center gap-4 border-b border-border px-4">
          <span className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--chart-2),transparent_80%)] blur-3xl" />
          <SidebarTrigger />
          <span className="text-base font-semibold">{activeItem?.label ?? "Dashboard"}</span>

          <div className="ml-auto flex items-center gap-4">
            {showLoginButton !== undefined && (
              <div className="flex items-center gap-2">
                <LogIn className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Login button</span>
                <Switch
                  checked={loginButtonVisible}
                  onCheckedChange={handleLoginToggle}
                  disabled={savingLoginToggle}
                />
              </div>
            )}

            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-full">
                Visit site
                <ExternalLink />
              </Button>
            </a>
          </div>
        </header>
        <main className="flex-1 md:p-6 py-5 px-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
