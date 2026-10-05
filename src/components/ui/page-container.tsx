export const PageContainer = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="space-y-6 p-4 md:p-6 w-full">
			{children}
		</div>
	)
}

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
			{children}
		</div>
	)
}

export const PageHeaderContent = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="space-y-1 w-full">{children}</div>
	)
}

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
	return <h1 className="text-xl font-bold md:text-2xl">{children}</h1>
}

export const PageDescription = ({ children }: { children: React.ReactNode }) => {
	return <p className="text-sm text-muted-foreground">{children}</p>
}

export const PageActions = ({ children }: { children: React.ReactNode }) => {
	return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

export const PageContent = ({ children }: { children: React.ReactNode }) => {
	return <div className="space-y-4">{children}</div>
}
