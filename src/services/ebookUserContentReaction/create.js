import { createClient } from "@/lib/supabase/server";

export const createReaction = async ({
	ebookUserContentId,
	pageNumber,
	reactUserId,
	reactUserEmail,
	reactDescription,
	reactType, // 'ANSWER' or 'THOUGHT'
	emotionType, // optional
	ebookUserContentQuestionId, // for ANSWER
}) => {
	const supabase = await createClient();

	// Get content number
	const { data: content } = await supabase
		.from("ebook_user_content")
		.select("ebook_user_content_number")
		.eq("id", ebookUserContentId)
		.single();

	if (!content) {
		throw new Error("Content not found");
	}

	// Single shot validation: check if user + page + type already exists
	const { data: existing } = await supabase
		.from("ebook_user_content_reaction")
		.select("id")
		.eq("react_user_id", reactUserId)
		.eq("ebook_user_content_id", ebookUserContentId)
		.eq("page_number", pageNumber)
		.eq("react_type", reactType)
		.single();

	if (existing) {
		throw new Error(
			"Reaction already exists for this user, page, and type. Use update instead.",
		);
	}

	// Generate unique number, e.g., timestamp-based
	const number = `rxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Insert
	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.insert({
			number,
			ebook_user_content_id: ebookUserContentId,
			ebook_user_content_number: content.ebook_user_content_number,
			page_number: pageNumber,
			react_user_id: reactUserId,
			react_user_email_address: reactUserEmail,
			react_description: reactDescription,
			react_type: reactType,
			emotion_type: emotionType,
			ebook_user_content_question_id:
				reactType === "ANSWER" ? ebookUserContentQuestionId : null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create reaction: ${error.message}`);
	}

	return data;
};
