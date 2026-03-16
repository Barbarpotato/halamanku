import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
		const emailAddress = searchParams.get("email_address");

		// forece contentNumber or emailAddress
		if (!contentNumber && !emailAddress) {
			return jsonResponse({ error: "Invalid request" }, 400);
		}

		let query = supabase.from("ebook_user_content_access").select(`
        *,
        ebook_user_content:ebook_user_content_id(
          id,
          ebook_user_content_number,
          ebook_user_content_title,
          publish_site_url,
          is_published,
		  supabase_file_storage_url
        )
      `);

		if (contentNumber) {
			query = query.eq("ebook_user_content_number", contentNumber);
		}

		if (emailAddress) {
			query = query.eq("email_address", emailAddress);
		}

		const { data, error } = await query.order("created", {
			ascending: false,
		});

		if (error) {
			return jsonResponse({ error: error.message }, 400);
		}

		return jsonResponse(data);
	} catch (error) {
		return jsonResponse({ error: error.message }, 500);
	}
}

// -----------------------------
// POST
// -----------------------------
export async function POST(request) {
	try {
		const body = await request.json();

		const {
			ebook_user_content_id,
			ebook_user_content_number,
			auth_user_id,
			email_address,
			lynk_id_reference_id,
		} = body;

		const { data, error } = await supabase
			.from("ebook_user_content_access")
			.insert([
				{
					ebook_user_content_id,
					ebook_user_content_number,
					auth_user_id,
					email_address,
					lynk_id_reference_id,
				},
			])
			.select()
			.single();

		if (error) {
			return jsonResponse({ error: error.message }, 400);
		}

		return jsonResponse(data, 201);
	} catch (error) {
		return jsonResponse({ error: error.message }, 500);
	}
}

// -----------------------------
// PUT
// -----------------------------
export async function PUT(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return jsonResponse({ error: "ID is required" }, 400);
		}

		const body = await request.json();

		const {
			ebook_user_content_number,
			email_address,
			lynk_id_reference_id,
		} = body;

		const { data, error } = await supabase
			.from("ebook_user_content_access")
			.update({
				ebook_user_content_number,
				email_address,
				lynk_id_reference_id,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return jsonResponse({ error: error.message }, 400);
		}

		return jsonResponse(data);
	} catch (error) {
		return jsonResponse({ error: error.message }, 500);
	}
}

// -----------------------------
// DELETE
// -----------------------------
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return jsonResponse({ error: "ID is required" }, 400);
		}

		const { error } = await supabase
			.from("ebook_user_content_access")
			.delete()
			.eq("id", id);

		if (error) {
			return jsonResponse({ error: error.message }, 400);
		}

		return jsonResponse({
			message: "Access record deleted successfully",
		});
	} catch (error) {
		return jsonResponse({ error: error.message }, 500);
	}
}
