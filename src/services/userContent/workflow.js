import { createClient } from "@/lib/supabase/client";

const WORKFLOW_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-workflow-service";

const PREVIEW_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/preview-service";

const supabase = createClient();

// Helper to get anon key
const getAnonKey = () => {
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const publishEbookUserContent = async (formData, content) => {
	const { data: templateData, error: templateError } = await supabase
		.from("ebook_template")
		.select("template_name")
		.eq("id", content.ebook_template_id)
		.single();

	if (templateError || !templateData) {
		throw new Error(templateError?.message || "Template not found");
	}

	await fetch(WORKFLOW_SERVICE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getAnonKey()}`,
		},
		body: JSON.stringify({
			new_repo: formData.ebook_user_content_number,
			event_type: "publish-ebook-site",
			content_number: formData.ebook_user_content_number,
			total_pages: content.storage_file_total_page,
			template_name: templateData.template_name,
		}),
	});
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
