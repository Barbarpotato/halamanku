import { createClient } from "@/lib/supabase/server";

export const createQuestion = async ({
	ebookUserContentId,
	pageNumber,
	question,
}) => {
	const supabase = await createClient();

	// Check if the content is not published and get total pages
	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select("*")
		.eq("id", ebookUserContentId)
		.single();

	if (contentError) {
		throw new Error("Konten tidak ditemukan.");
	}

	if (content?.is_published) {
		throw new Error(
			"Pertanyaan tidak dapat dibuat untuk konten yang sudah dipublikasikan.",
		);
	}

	// Check if a question already exists for this page
	const { data: existingQuestion } = await supabase
		.from("ebook_user_content_question")
		.select("id")
		.eq("ebook_user_content_id", ebookUserContentId)
		.eq("page_number", pageNumber)
		.single();

	if (existingQuestion) {
		throw new Error("Pertanyaan sudah ada untuk halaman ini.");
	}

	// Insert the question
	const { data, error } = await supabase
		.from("ebook_user_content_question")
		.insert({
			number: Date.now(), // Use timestamp as a simple unique number
			author_user_id: content.ebook_user_id,
			ebook_user_content_number: content.ebook_user_content_number,
			ebook_user_content_id: ebookUserContentId,
			page_number: pageNumber,
			question,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create question: ${error.message}`);
	}

	return data;
};
