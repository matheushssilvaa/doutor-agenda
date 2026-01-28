"use client"

import {
	CalendarDays,
	LayoutDashboard,
	LogOut,
	Stethoscope,
	UsersRound
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
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Agendamentos",
		url: "/appointments",
		icon: CalendarDays,
	},
	{
		title: "Médicos",
		url: "/doctors",
		icon: Stethoscope,
	},
	{
		title: "Pacientes",
		url: "/patients",
		icon: UsersRound,
	},
]

const AppSidebar = () => {
	const router = useRouter()
	const session = authClient.useSession()
	const pathName = usePathname()

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/authentication")
				}
			}
		})
	}

	const initialsClinicName = session.data?.user.clinic?.name
		.split(" ").map((name) => name[0]).join("")

	return (
		<Sidebar>
			<SidebarHeader className="p-4 border-b">
				<Image src="/logo.svg" alt="Dr. Agenda" width={136} height={8} />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu principal</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathName == item.url}>
										<Link href={item.url}>
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
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton size="lg">
									<Avatar>
										<AvatarFallback>{initialsClinicName}</AvatarFallback>
									</Avatar>
									<div>
										<p className="text-sm">{session.data?.user.clinic?.name}</p>
										<p className="truncate w-[85%] text-sm text-muted-foreground">{session.data?.user.email}</p>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOut />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}

export default AppSidebar