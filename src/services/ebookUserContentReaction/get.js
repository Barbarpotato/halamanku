import { createClient } from "@/lib/supabase/server";

export const getReactionsByContentId = async (ebookUserContentId) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.select("*")
		.eq("ebook_user_content_id", ebookUserContentId)
		.order("created", { ascending: false });

	if (error) {
		throw new Error(`Failed to get reactions: ${error.message}`);
	}

	return data || [];
};

export const getHighlightedReactionsByContentId = async (
	ebookUserContentId,
) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.select("*")
		.eq("ebook_user_content_id", ebookUserContentId)
		.eq("is_highlight", true)
		.order("created", { ascending: false });

	if (error) {
		throw new Error(
			`Failed to get highlighted reactions: ${error.message}`,
		);
	}

	return data || [];
};

export const getReactionById = async (reactionId) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.select("*")
		.eq("id", reactionId)
		.single();

	if (error) {
		throw new Error(`Failed to get reaction: ${error.message}`);
	}

	return data;
};
