import Image from "next/image"
import React from "react"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import AppSidebar from "./_components/App-sidebar"

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-full min-w-0">
				<header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-4 py-3 md:static md:justify-start md:border-none md:bg-transparent md:px-2 md:py-2">
					<SidebarTrigger />
					<Image
						src="/Logo.svg"
						alt="Dr. Agenda"
						width={112}
						height={28}
						className="md:hidden"
						priority
					/>
				</header>
				{children}
			</main>
		</SidebarProvider>
	)
}

export default ProtectedLayout
