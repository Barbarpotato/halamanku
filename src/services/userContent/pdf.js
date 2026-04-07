import { createClient } from "@/lib/supabase/client";
import { STORAGE_URL } from "@/lib/supabase/supabase";

const supabase = createClient();

// Helper to get anon key
const getAnonKey = () => {
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const validatePdfFile = (file) => {
	if (!file) {
		return "Please select a file first";
	}

	if (file.type !== "application/pdf") {
		return "Only PDF files are allowed";
	}

	return null;
};

export const uploadPdf = async (contentId, pdfFile) => {
	const formData = new FormData();
	formData.append("file", pdfFile);
	formData.append("id", contentId);

	const response = await fetch(STORAGE_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${getAnonKey()}`,
		},
		body: formData,
	});

	const result = await response.json();

	if (result.status === "SUCCESS") {
		const path = result.data.path;
		// updating directly in database
		await supabase
			.from("ebook_user_content")
			.update({
				upload_worker_status: "PROCESSING",
			})
			.eq("id", contentId);
		return path;
	} else {
		throw new Error(result.error || "Upload failed");
	}
};

export const getPdfUrl = async (pdfPath) => {
	if (!pdfPath) {
		throw new Error("No file to view");
	}

	const url = `${STORAGE_URL}?path=${encodeURIComponent(pdfPath)}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${getAnonKey()}`,
		},
	});

	const result = await response.json();

	if (result.status === "SUCCESS") {
		return result.data.signedUrl;
	} else {
		throw new Error(result.error || "Failed to get URL");
	}
};

export const deletePdf = async (contentId, storage_file_name) => {
	if (!storage_file_name) {
		throw new Error("No file to delete");
	}

	const formData = new FormData();
	formData.append("path", storage_file_name);

	// validate the content data
	const { data: contentData, error: contentError } = await supabase
		.from("ebook_user_content")
		.select()
		.eq("id", contentId)
		.single();

	if (contentError) {
		throw contentError;
	}

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

	// updating directly in database
	const { error: updateError } = await supabase
		.from("ebook_user_content")
		.update({
			storage_file_total_page: null,
			upload_worker_status: "IDLE",
			storage_file_name: null,
		})
		.eq("id", contentId);

	if (updateError) {
		throw updateError;
	}

	return true;
};
