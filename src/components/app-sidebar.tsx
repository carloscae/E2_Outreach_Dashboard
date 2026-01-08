"use client"

import * as React from "react"
import {
    BarChart3,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Radio,
    Settings,
    Target,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import { usePathname } from "next/navigation"

const mainNavItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Signals",
        url: "/dashboard/signals",
        icon: Radio,
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: FileText,
    },
    {
        title: "Pipeline",
        url: "/dashboard/pipeline",
        icon: Users,
        disabled: true,
    },
]

const secondaryNavItems = [
    {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
        disabled: true,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        disabled: true,
    },
    {
        title: "Help",
        url: "/dashboard/help",
        icon: HelpCircle,
        disabled: true,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    const isActive = (url: string) => {
        if (url === "/dashboard") {
            return pathname === "/dashboard"
        }
        return pathname.startsWith(url)
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Target className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">E2 Intelligence</span>
                                    <span className="truncate text-xs text-muted-foreground">Market Signals</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        disabled={item.disabled}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.disabled ? "#" : item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        disabled={item.disabled}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.disabled ? "#" : item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
