import { createClient } from "@/lib/supabase/client";

const PREVIEW_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/preview-service";

const PUBLISH_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/publish-service";

const supabase = createClient();

export const publishEbookUserContent = async (formData) => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("User not authenticated");
	}

	const response = await fetch(PUBLISH_SERVICE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({
			content_number: formData.ebook_user_content_number,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status}`);
	}

	const result = await response.json();

	if (result.status !== "SUCCESS") {
		throw new Error(result.error || "Failed to create preview");
	}

	return result;
};

export const createPreview = async (formData) => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("User not authenticated");
	}

	const response = await fetch(PREVIEW_SERVICE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({
			content_number: formData.ebook_user_content_number,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status}`);
	}

	const result = await response.json();

	if (result.status !== "SUCCESS") {
		throw new Error(result.error || "Failed to create preview");
	}

	return result;
};
