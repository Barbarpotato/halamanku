import { createClient } from "@/lib/supabase/server";

export const updateReaction = async ({
	reactionId,
	reactDescription,
	emotionType,
}) => {
	const supabase = await createClient();

	// Get current reaction
	const { data: reaction, error: fetchError } = await supabase
		.from("ebook_user_content_reaction")
		.select("author_response, update_attempt")
		.eq("id", reactionId)
		.single();

	if (fetchError || !reaction) {
		throw new Error("Reaction not found");
	}

	// Check if edit is allowed
	if (reaction.author_response !== null) {
		throw new Error("Cannot edit reaction after author has responded");
	}

	if (reaction.update_attempt >= 3) {
		throw new Error("Edit limit reached. Reaction is locked.");
	}

	// Update and increment attempt
	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.update({
			react_description: reactDescription,
			emotion_type: emotionType,
			update_attempt: reaction.update_attempt + 1,
		})
		.eq("id", reactionId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update reaction: ${error.message}`);
	}

	return data;
};
