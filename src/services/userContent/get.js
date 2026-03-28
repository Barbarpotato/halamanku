import { createClient } from "@/lib/supabase/server";

export const getEbookUserContentByNumber = async (
	contentNumber,
	ebookUserId,
) => {
	const supabase = await createClient();

	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select("*")
		.eq("ebook_user_content_number", contentNumber)
		.eq("ebook_user_id", ebookUserId)
		.single();

	return content;
};

export const getEbookUserContentList = async (ebookUserId) => {
	const supabase = await createClient();

	const { data: userContents } = await supabase
		.from("ebook_user_content")
		.select(`*`)
		.eq("ebook_user_id", ebookUserId)
		.order("created", { ascending: false });

	return userContents || [];
};
