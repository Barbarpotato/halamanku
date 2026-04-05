import { createClient } from "@/lib/supabase/server";

export const highlightReaction = async (reactionId) => {
	const supabase = await createClient();

	// Update is_highlight to true
	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.update({
			is_highlight: true,
		})
		.eq("id", reactionId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to highlight reaction: ${error.message}`);
	}

	// Now it's public: other readers can see it via queries
	return data;
};

export const unhighlightReaction = async (reactionId) => {
	const supabase = await createClient();

	// Update is_highlight to false
	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.update({
			is_highlight: false,
		})
		.eq("id", reactionId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to unhighlight reaction: ${error.message}`);
	}

	return data;
};
