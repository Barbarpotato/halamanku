import { createClient } from "@/lib/supabase/client";
import { randomBytes } from "crypto";

const supabase = createClient();

export const createEbookUserContent = async (formData, ebookUser) => {
	const { data, error: insertError } = await supabase
		.from("ebook_user_content")
		.insert([
			{
				ebook_user_id: ebookUser.id,
				ebook_user_content_number: `CNT-${randomBytes(8).toString("hex")}`,
				ebook_user_content_title:
					formData.ebook_user_content_title.trim(),
				ebook_user_content_description:
					formData.ebook_user_content_description.trim(),
				is_published: false,
				is_private: formData.is_private,
			},
		])
		.select()
		.single();

	if (insertError) {
		throw insertError;
	}

	return data;
};
