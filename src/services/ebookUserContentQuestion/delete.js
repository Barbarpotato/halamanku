import { createClient } from "@/lib/supabase/server";

export const deleteQuestion = async (questionId) => {
	const supabase = await createClient();

	// First, get the question to check the content's published status
	const { data: question, error: questionError } = await supabase
		.from("ebook_user_content_question")
		.select("ebook_user_content_id")
		.eq("id", questionId)
		.single();

	if (questionError || !question) {
		throw new Error("Question not found");
	}

	// Check if the content is not published
	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select("is_published")
		.eq("id", question.ebook_user_content_id)
		.single();

	if (contentError || content?.is_published) {
		throw new Error("Cannot delete question for published content");
	}

	// Delete the question
	const { error } = await supabase
		.from("ebook_user_content_question")
		.delete()
		.eq("id", questionId);

	if (error) {
		throw new Error(`Failed to delete question: ${error.message}`);
	}

	return { success: true };
};
