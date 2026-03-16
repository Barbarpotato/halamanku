import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get all ebook templates or single template by ID
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			const { data, error } = await supabase
				.from("ebook_template")
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
			.from("ebook_template")
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

// POST - Create a new ebook template
export async function POST(request) {
	try {
		const body = await request.json();
		const {
			raw_githubusercontent_url,
			owner_name,
			repository_name,
			branch_name,
			file_path,
			is_premium,
			template_name,
		} = body;

		const { data, error } = await supabase
			.from("ebook_template")
			.insert([
				{
					raw_githubusercontent_url,
					owner_name,
					repository_name,
					branch_name,
					file_path,
					is_premium: is_premium ?? false,
					template_name,
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

// PUT - Update an ebook template
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
			raw_githubusercontent_url,
			owner_name,
			repository_name,
			branch_name,
			file_path,
			is_premium,
			template_name,
		} = body;

		const { data, error } = await supabase
			.from("ebook_template")
			.update({
				raw_githubusercontent_url,
				owner_name,
				repository_name,
				branch_name,
				file_path,
				is_premium,
				template_name,
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

// DELETE - Delete an ebook template
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
			.from("ebook_template")
			.delete()
			.eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: "Template deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
