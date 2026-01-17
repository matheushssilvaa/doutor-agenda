"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignUpForm from "./components/Sign-up-form"
import LoginForm from "./components/Login-form"

const AuthenticationPage = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Tabs defaultValue="login">
                    <TabsList>
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Criar conta</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <SignUpForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AuthenticationPage