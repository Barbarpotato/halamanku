import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const deleteEbookUserContentAccess = async (accessId) => {
	// Get the current user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("User not authenticated");
	}

	// Get the access record to check ownership
	const { data: accessRecord, error: fetchError } = await supabase
		.from("ebook_user_content_access")
		.select("email_address")
		.eq("id", accessId)
		.single();

	if (fetchError) {
		throw fetchError;
	}

	// Prevent deleting own access
	if (accessRecord.email_address === user.email) {
		throw new Error("You cannot delete your own access");
	}

	// Proceed with deletion
	const { error } = await supabase
		.from("ebook_user_content_access")
		.delete()
		.eq("id", accessId);

	if (error) {
		throw error;
	}
};
