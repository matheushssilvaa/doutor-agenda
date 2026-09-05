import { db } from "@/db"
import { usersTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export const POST = async (request: Request) => {
	if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
		throw new Error("Stripe secret key not found")
	}
	const signature = request.headers.get("stripe-signature")
	if (!signature) {
		throw new Error("Stripe signature not found")
	}
	const text = await request.text()
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2025-05-28.basil"
	})

	// Verificando se é realmente o Stripe que está enviando a requisição
	// HMAC com SHA256
	const event = await stripe.webhooks.constructEventAsync(
		text,
		signature,
		process.env.STRIPE_WEBHOOK_SECRET, //STRIPE_WEBHOOK_SECRET gerado pela ferramenta de CLI do Stripe
	)

	// Filtrando os eventos que o Stripe retorna para o Webhook
	switch (event.type) {
		case "invoice.paid": {
			if (!event.data.object.id) {
				throw new Error()
			}
			const subscription = await stripe.subscriptions.retrieve(
				event.data.object.id
			)
			if (!subscription) {
				throw new Error()
			}
			const userId = subscription.metadata.userId

			if (!userId) {
				throw new Error("User ID not found")
			}

			await db.update(usersTable).set({
				stripeCustomerId: subscription.id,
				stripeSubscriptionId: subscription.customer as string,
				plan: "essential"
			}).where(eq(usersTable.id, userId))
		}
		case "customer.subscription.deleted": {
			if (!event.data.object.id) {
				throw new Error()
			}
			const subscription = await stripe.subscriptions.retrieve(
				event.data.object.id
			)
			if (!subscription) {
				throw new Error()
			}
			const userId = subscription.metadata.userId

			if (!userId) {
				throw new Error("User ID not found")
			}

			await db.update(usersTable).set({
				stripeCustomerId: subscription.id,
				stripeSubscriptionId: subscription.customer as string,
				plan: "essential"
			}).where(eq(usersTable.id, userId))
		}
	}
	return NextResponse.json({
		received: true
	})
}