import { createClient } from "@/lib/supabase/client";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

const supabase = createClient();

// Helper to get anon key
const getAnonKey = () => {
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const deleteEbookUserContent = async (content) => {
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
