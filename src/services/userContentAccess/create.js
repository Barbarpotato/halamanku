import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const createEbookUserContentAccess = async (
	contentNumber,
	emailAddress,
	contentId,
	refId,
) => {
	// get the ebook_user_content data from the contentNumber
	const { data: content } = await supabase
		.from("ebook_user_content")
		.select("*")
		.eq("ebook_user_content_number", contentNumber)
		.single();

	if (!content) {
		throw new Error("Content not found");
	}

	// get the storage_file_name and replace .pdf with empty string
	const storageFileName = content.storage_file_name.replace(".pdf", "");

	const { data, error } = await supabase
		.from("ebook_user_content_access")
		.upsert(
			{
				created: new Date().toISOString(),
				ebook_user_content_id: contentId,
				ebook_user_content_number: contentNumber,
				email_address: emailAddress.trim(),
				auth_user_id: null,
				lynk_id_reference_id: refId,
				storage_shard_name: storageFileName,
			},
			{
				onConflict: "email_address,ebook_user_content_number",
			},
		)
		.select()
		.single();
	if (error) {
		throw error;
	}

	return data;
};
