import { createClient } from "@/lib/supabase/server";

export const authorRespond = async ({ reactionId, authorResponse }) => {
	const supabase = await createClient();

	// Update with author_response
	const { data, error } = await supabase
		.from("ebook_user_content_reaction")
		.update({
			author_response: authorResponse,
		})
		.eq("id", reactionId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to submit author response: ${error.message}`);
	}

	// The lock is implicit: once author_response is set, edit is disabled
	return data;
};
