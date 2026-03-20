import { createClient } from "@/lib/supabase/client";
import { randomBytes } from "crypto";

const supabase = createClient();

export const createEbookUserContent = async (formData, ebookUser) => {
	const templateId = formData.ebook_template_id.trim();

	const { data: templateData, error: templateError } = await supabase
		.from("ebook_template")
		.select("raw_githubusercontent_url")
		.eq("id", templateId)
		.single();

	if (templateError || !templateData) {
		throw new Error("Template not found");
	}

	const { data, error: insertError } = await supabase
		.from("ebook_user_content")
		.insert([
			{
				ebook_user_id: ebookUser.id,
				ebook_template_id: templateId,
				ebook_user_content_number: `CNT-${randomBytes(8).toString("hex")}`,
				ebook_user_content_title:
					formData.ebook_user_content_title.trim(),
				ebook_user_content_description:
					formData.ebook_user_content_description.trim(),
				is_published: false,
			},
		])
		.select()
		.single();

	if (insertError) {
		throw insertError;
	}

	return data;
};
