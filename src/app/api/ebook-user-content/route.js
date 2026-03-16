import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get all ebook user content or single content by ID
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		const userId = searchParams.get("user_id");

		if (id) {
			const { data, error } = await supabase
				.from("ebook_user_content")
				.select(
					`
          *,
          ebook_user:ebook_user_id(id, name, email_address, user_number),
          ebook_template:ebook_template_id(id, owner_name, repository_name, file_path)
        `,
				)
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

		let query = supabase.from("ebook_user_content").select(`
        *,
        ebook_user:ebook_user_id(id, name, email_address, user_number),
        ebook_template:ebook_template_id(id, owner_name, repository_name, file_path)
      `);

		if (userId) {
			query = query.eq("ebook_user_id", userId);
		}

		const { data, error } = await query.order("created", {
			ascending: false,
		});

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// POST - Create a new ebook user content
export async function POST(request) {
	try {
		const body = await request.json();
		const {
			ebook_user_id,
			ebook_user_content_number,
			ebook_user_content_title,
			ebook_user_content_description,
			ebook_template_id,
			ebook_template_preview_code,
			template_primary_background_color,
			template_secondary_background_color,
			template_text_color,
			template_heading_text,
			supabase_file_storage_url,
			publish_site_url,
			is_published,
		} = body;

		const { data, error } = await supabase
			.from("ebook_user_content")
			.insert([
				{
					ebook_user_id,
					ebook_user_content_number,
					ebook_user_content_title,
					ebook_user_content_description,
					ebook_template_id,
					ebook_template_preview_code,
					template_primary_background_color,
					template_secondary_background_color,
					template_text_color,
					template_heading_text,
					supabase_file_storage_url,
					publish_site_url,
					is_published: is_published ?? false,
					published_date: is_published
						? new Date().toISOString()
						: null,
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

// PUT - Update an ebook user content
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
			ebook_user_content_number,
			ebook_user_content_title,
			ebook_user_content_description,
			ebook_template_id,
			ebook_template_preview_code,
			template_primary_background_color,
			template_secondary_background_color,
			template_text_color,
			template_heading_text,
			supabase_file_storage_url,
			publish_site_url,
			is_published,
		} = body;

		const updateData = {
			ebook_user_content_number,
			ebook_user_content_title,
			ebook_user_content_description,
			ebook_template_id,
			ebook_template_preview_code,
			template_primary_background_color,
			template_secondary_background_color,
			template_text_color,
			template_heading_text,
			supabase_file_storage_url,
			publish_site_url,
			is_published,
		};

		// Update published_date if publishing/unpublishing
		if (is_published !== undefined) {
			updateData.published_date = is_published
				? new Date().toISOString()
				: null;
		}

		const { data, error } = await supabase
			.from("ebook_user_content")
			.update(updateData)
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

// DELETE - Delete an ebook user content
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
			.from("ebook_user_content")
			.delete()
			.eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: "Content deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
