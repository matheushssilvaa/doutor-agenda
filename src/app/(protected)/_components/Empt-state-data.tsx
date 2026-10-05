"use client"

import { CircleAlert, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmptyStateDataProps {
	title: string
	description: string
	action: string
	urlAction?: string
	actionComponent?: React.ReactNode
}

const EmptyStateData = ({
	title,
	description,
	action,
	urlAction,
	actionComponent
}: EmptyStateDataProps) => {

	const router = useRouter()

	const handleAction = () => {
		if (urlAction) {
			router.push(urlAction)
		}
	}

	return (
		<Card>
			<div className="flex flex-col justify-center items-center gap-4 px-4 text-center">
				<CircleAlert />
				<h2 className="font-bold text-xl">{title}</h2>
				<p className="text-sm text-muted-foreground">
					{description}
				</p>
				{actionComponent ? (
					actionComponent
				) : (
					<Button variant="secondary"
						onClick={handleAction}>
						<Plus />
						{action}
					</Button>
				)}
			</div>
		</Card>
	)
}

export default EmptyStateData