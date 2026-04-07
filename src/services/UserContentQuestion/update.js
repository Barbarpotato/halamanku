import { createClient } from "@/lib/supabase/server";

export const updateQuestion = async ({
	ebookUserContentId,
	pageNumber,
	question,
}) => {
	const supabase = await createClient();

	// Check if the content is not published and validate page number
	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select("is_published, storage_file_total_page")
		.eq("id", ebookUserContentId)
		.single();

	if (contentError || content?.is_published) {
		throw new Error(
			"Cannot update question for published content or content not found",
		);
	}

	if (!content?.storage_file_total_page) {
		throw new Error("PDF not uploaded yet");
	}

	if (pageNumber > content.storage_file_total_page) {
		throw new Error(
			`Page number cannot exceed total pages (${content.storage_file_total_page})`,
		);
	}

	// Update the question if it exists
	const { data, error } = await supabase
		.from("ebook_user_content_question")
		.update({ question })
		.eq("ebook_user_content_id", ebookUserContentId)
		.eq("page_number", pageNumber)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update question: ${error.message}`);
	}

	if (!data) {
		throw new Error("Question not found for this page");
	}

	return data;
};
