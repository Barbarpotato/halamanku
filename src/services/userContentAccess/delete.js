import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const deleteEbookUserContentAccess = async (accessId) => {
	const { error } = await supabase
		.from("ebook_user_content_access")
		.delete()
		.eq("id", accessId);

	if (error) {
		throw error;
	}
};
