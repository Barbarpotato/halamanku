import { createClient } from "@/lib/supabase/server";

export const getQuestionsByContentId = async (ebookUserContentId) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ebook_user_content_question")
		.select("*")
		.eq("ebook_user_content_id", ebookUserContentId)
		.order("page_number");

	if (error) {
		throw new Error(`Failed to get questions: ${error.message}`);
	}

	return data || [];
};

export const getQuestionByPage = async (ebookUserContentId, pageNumber) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ebook_user_content_question")
		.select("*")
		.eq("ebook_user_content_id", ebookUserContentId)
		.eq("page_number", pageNumber)
		.single();

	if (error && error.code !== "PGRST116") {
		// PGRST116 is no rows
		throw new Error(`Failed to get question: ${error.message}`);
	}

	return data;
};
