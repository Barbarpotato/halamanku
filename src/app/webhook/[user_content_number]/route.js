import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
	const { user_content_number } = params;

	// 🔒 1. Ensure secret exists
	const secretKey = "xFp8X0l4hKAP8eU1TWzpPNGiEtfPxYN2";
	if (!secretKey) {
		console.error("❌ Missing LYNK_SECRET_KEY");
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);
	}

	try {
		// 🔍 2. Parse body
		const body = await request.json();

		// 🔍 3. Extract headers safely
		const headers = Object.fromEntries(request.headers.entries());

		const signature =
			headers["x-lynk-signature"] || headers["X-Lynk-Signature"];

		if (!signature) {
			return NextResponse.json(
				{ error: "Missing signature" },
				{ status: 400 },
			);
		}

		// 🔍 4. Validate payload structure
		const { refId, grandTotal, message_id, data } = body;

		if (!refId || !grandTotal || !message_id) {
			return NextResponse.json(
				{ error: "Invalid payload" },
				{ status: 400 },
			);
		}

		// 🔐 5. Validate signature
		const signatureString =
			String(grandTotal) + String(refId) + String(message_id) + secretKey;

		const calculatedSignature = crypto
			.createHash("sha256")
			.update(signatureString)
			.digest("hex");

		if (calculatedSignature !== signature) {
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 401 },
			);
		}

		// 🧠 6. Setup DB
		const supabase = await createClient();

		// // 🚫 7. Idempotency check (CRITICAL)
		// const { data: existing } = await supabase
		// 	.from("webhook_logs")
		// 	.select("id")
		// 	.eq("message_id", message_id)
		// 	.maybeSingle();

		// if (existing) {
		// 	console.log("⚠️ Duplicate webhook ignored:", message_id);
		// 	return NextResponse.json({ success: true });
		// }

		// // 💾 8. Store webhook log
		// await supabase.from("webhook_logs").insert({
		// 	message_id,
		// 	ref_id: refId,
		// 	amount: grandTotal,
		// 	user_content_number,
		// 	payload: body,
		// 	created_at: new Date().toISOString(),
		// });

		// // 💰 9. BUSINESS LOGIC (YOU MUST CUSTOMIZE THIS)
		// // Example: mark content as paid/unlocked

		// const { error: updateError } = await supabase
		// 	.from("ebook_user_content")
		// 	.update({
		// 		is_paid: true,
		// 		paid_at: new Date().toISOString(),
		// 	})
		// 	.eq("ebook_user_content_number", user_content_number);

		// if (updateError) {
		// 	console.error("❌ Failed to update content:", updateError);

		// 	// Important: return 200 anyway so Lynk doesn't spam retries
		// 	return NextResponse.json({ success: true });
		// }

		// console.log("✅ Webhook processed:", {
		// 	message_id,
		// 	refId,
		// 	grandTotal,
		// });

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("🔥 Webhook error:", err);

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
