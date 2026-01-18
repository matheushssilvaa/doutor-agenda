"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const SignOutButton = () => {
    const router = useRouter()
    return (
        <Button onClick={() => authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/authentication")
                }
            }
        })}>
            Logout
        </Button>
    )
}

export default SignOutButton