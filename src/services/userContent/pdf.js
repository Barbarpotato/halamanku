import { createClient } from "@/lib/supabase/client";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

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
		await supabase
			.from("ebook_user_content")
			.update({
				storage_file_name: path,
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
