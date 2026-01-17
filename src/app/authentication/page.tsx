"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignUpForm from "./components/Sign-up-form"

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
                        <Card>

                        </Card>
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