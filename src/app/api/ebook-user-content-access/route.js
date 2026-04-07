import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase";

// -----------------------------
// CORS CONFIG
// -----------------------------
const corsHeaders = {
	"Access-Control-Allow-Origin": "*", // change to your domain for security
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// helper
function jsonResponse(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: corsHeaders,
	});
}

// -----------------------------
// OPTIONS (CORS PREFLIGHT)
// -----------------------------
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders,
	});
}

// -----------------------------
// GET
// -----------------------------
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		const contentNumber = searchParams.get("content_number");

		// ❌ REMOVE email from query — never trust client input
		if (!contentNumber) {
			return jsonResponse({ error: "content_number required" }, 400);
		}

		// 🔐 1. Get access token from header
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return jsonResponse({ error: "Unauthorized" }, 401);
		}

		const token = authHeader.replace("Bearer ", "");

		// 🔐 2. Validate token with Supabase
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return jsonResponse({ error: "Invalid token" }, 401);
		}

		const emailAddress = user.email;

		// 🧠 3. Query using VERIFIED identity
		let query = supabase.from("ebook_user_content_access").select("*");

		query = query
			.eq("ebook_user_content_number", contentNumber)
			.eq("email_address", emailAddress);

		const { _data, error } = await query.order("created", {
			ascending: false,
		});

		if (error) {
			return jsonResponse({ error: error.message }, 400);
		}

		return jsonResponse({
			status: "SUCCESS",
		});
	} catch (error) {
		return jsonResponse({ error: error.message }, 500);
	}
}
