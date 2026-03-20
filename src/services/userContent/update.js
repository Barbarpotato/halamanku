import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const updateEbookUserContent = async (contentId, formData) => {
	const updateData = {
		ebook_template_id: formData.ebook_template_id || null,
		ebook_user_content_number: formData.ebook_user_content_number,
		ebook_user_content_title: formData.ebook_user_content_title,
		ebook_user_content_description: formData.ebook_user_content_description,
		template_primary_background_color:
			formData.template_primary_background_color,
		template_secondary_background_color:
			formData.template_secondary_background_color,
		template_text_color: formData.template_text_color,
		template_heading_text: formData.template_heading_text,
		ebook_template_preview_code: formData.template_preview_code,
		is_published: formData.is_published,
	};

	const { error: updateError } = await supabase
		.from("ebook_user_content")
		.update(updateData)
		.eq("id", contentId)
		.eq("is_published", false);

	if (updateError) {
		throw updateError;
	}
};
