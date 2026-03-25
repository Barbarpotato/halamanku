import { NextResponse } from "next/server";
import crypto from "crypto";
import { createEbookUserContentAccess } from "@/services/userContentAccess/create";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
	const { user_number } = await params;

	const supabase = await createClient();

	// get the ebook_user based on the user_number
	const { data: ebookUser } = await supabase
		.from("ebook_user")
		.select("*")
		.eq("user_number", user_number)
		.single();

	if (!ebookUser) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const secretKey = ebookUser.lynk_id_merchant_key;
	if (!secretKey) {
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);
	}

	try {
		const body = await request.json();

		const headers = Object.fromEntries(request.headers.entries());

		const signature =
			headers["x-lynk-signature"] || headers["X-Lynk-Signature"];

		const { event, data } = body;

		const refId = data?.message_data?.refId;
		const grandTotal = data?.message_data?.totals?.grandTotal;
		const message_id = data?.message_id;

		const emailAddress = data?.message_data?.customer?.email;
		const itemTitleList = data?.message_data?.items?.map(
			(item) => item.title,
		);

		if (signature && event === "payment.received") {
			const signatureString =
				String(grandTotal) +
				String(refId) +
				String(message_id) +
				secretKey;

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

			// get the ebook_user_content -> ebook_content_title based on the itemTitleList
			const { data: ebookUserContentList } = await supabase
				.from("ebook_user_content")
				.select("*")
				.eq("ebook_user_id", ebookUser.id)
				.in("ebook_user_content_title", itemTitleList);

			if (ebookUserContentList.length > 0) {
				// insert the ebook_user_content_access for each ebook_user_content
				for (const ebookUserContent of ebookUserContentList) {
					await createEbookUserContentAccess(
						ebookUserContent.ebook_user_content_number,
						emailAddress,
						ebookUserContent.id,
						refId,
					);
				}
			}
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
