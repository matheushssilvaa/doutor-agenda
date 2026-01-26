import { createSafeActionClient } from "next-safe-action"

export const actionClient = createSafeActionClient({
	handleServerError(error) {
		console.error("server error: ", error)

		if (error instanceof Error) {
			return error.message
		}

		return "Server error"
	}
})