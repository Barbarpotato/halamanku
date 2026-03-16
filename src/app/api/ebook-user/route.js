import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get all ebook users or single user by ID
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			const { data, error } = await supabase
				.from("ebook_user")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				return NextResponse.json(
					{ error: error.message },
					{ status: 404 },
				);
			}

			return NextResponse.json(data);
		}

		const { data, error } = await supabase
			.from("ebook_user")
			.select("*")
			.order("created", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// POST - Create a new ebook user
export async function POST(request) {
	try {
		const body = await request.json();
		const {
			auth_user_id,
			user_number,
			name,
			email_address,
			is_premium,
			lynk_id_webhook_url,
		} = body;

		const { data, error } = await supabase
			.from("ebook_user")
			.insert([
				{
					auth_user_id,
					user_number,
					name,
					email_address,
					is_premium: is_premium ?? false,
					lynk_id_webhook_url,
				},
			])
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// PUT - Update an ebook user
export async function PUT(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID is required" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const {
			user_number,
			name,
			email_address,
			is_premium,
			lynk_id_webhook_url,
		} = body;

		const { data, error } = await supabase
			.from("ebook_user")
			.update({
				user_number,
				name,
				email_address,
				is_premium,
				lynk_id_webhook_url,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// DELETE - Delete an ebook user
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID is required" },
				{ status: 400 },
			);
		}

		const { error } = await supabase
			.from("ebook_user")
			.delete()
			.eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
