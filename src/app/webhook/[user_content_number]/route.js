import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request, { params }) {
	const { user_content_number } = params;

	try {
		const body = await request.json();

		const signature = request.headers.get("X-Lynk-Signature");

		if (!signature) {
			return NextResponse.json(
				{ error: "Missing signature" },
				{ status: 400 },
			);
		}

		const { refId, grandTotal, message_id, data } = body;

		// ⚠️ DO NOT HARDCODE THIS
		const secretKey = process.env.LYNK_SECRET_KEY;

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

		// ✅ At this point: TRUSTED REQUEST

		// TODO: process transaction
		console.log("Valid webhook:", {
			user_content_number,
			refId,
			grandTotal,
			message_id,
			data,
		});

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Webhook error:", err);

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
