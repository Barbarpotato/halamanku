import { createClient } from "@/lib/supabase/client";
import { STORAGE_URL } from "@/lib/supabase/supabase";

const supabase = createClient();

// Helper to get anon key
const getAnonKey = () => {
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const deleteEbookUserContent = async (content) => {
	// check the content is exist or not
	const { data: contentData, error: contentError } = await supabase
		.from("ebook_user_content")
		.select()
		.eq("id", content.id)
		.single();

	if (contentError) {
		throw contentError;
	}

	// cannot delete if the upload worker is on the processing
	if (contentData.upload_worker_status == "PROCESSING") {
		throw new Error(
			"Konten Anda sedang diproses.Silakan coba lagi dalam beberapa menit.",
		);
	}

	if (content.storage_file_name) {
		const formData = new FormData();
		formData.append("path", content.storage_file_name);

		const response = await fetch(STORAGE_URL, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${getAnonKey()}`,
			},
			body: formData,
		});

		const result = await response.json();

		if (result.status !== "SUCCESS") {
			console.error("Failed to delete file from storage:", result.error);
		}
	}

	// Delete access records
	const { error: deleteEbookContentAccess } = await supabase
		.from("ebook_user_content_access")
		.delete()
		.eq("ebook_user_content_number", content.ebook_user_content_number);

	if (deleteEbookContentAccess) {
		throw deleteEbookContentAccess;
	}

	// Delete the ebook
	// make sure the ebook is not published yet
	const { error: deleteError } = await supabase
		.from("ebook_user_content")
		.delete()
		.eq("id", content.id)
		.eq("is_published", false);

	if (deleteError) {
		throw deleteError;
	}
};
