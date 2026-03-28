import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const updateEbookUserContent = async (contentId, formData) => {
	const updateData = {
		ebook_user_content_number: formData.ebook_user_content_number,
		ebook_user_content_title: formData.ebook_user_content_title,
		ebook_user_content_description: formData.ebook_user_content_description,
		template_primary_background_color:
			formData.template_primary_background_color,
		template_secondary_background_color:
			formData.template_secondary_background_color,
		template_text_color: formData.template_text_color,
		template_heading_text: formData.template_heading_text,
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

export const publishEbookUserContent = async (formData) => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("User not authenticated");
	}

	const { error: publishError } = await supabase
		.from("ebook_user_content")
		.update({
			is_published: true,
			published_date: new Date().toISOString(),
		})
		.eq("ebook_user_content_number", formData.ebook_user_content_number);

	if (publishError) {
		throw publishError;
	}

	return true;
};
