import { NextResponse } from "next/server";

export async function GET(request, { params }) {
	const { user_content_number } = params;

	// Handle GET request for webhook
	return NextResponse.json({
		message: "Webhook GET received for " + user_content_number,
	});
}
