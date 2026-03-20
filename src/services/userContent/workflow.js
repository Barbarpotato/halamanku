import { createClient } from "@/lib/supabase/client";

const WORKFLOW_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-workflow-service";

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

export const createPreview = async (formData, content, user) => {
	const { data: templateData, error: templateError } = await supabase
		.from("ebook_template")
		.select("template_name")
		.eq("id", content.ebook_template_id)
		.single();

	if (templateError || !templateData) {
		throw new Error(templateError?.message || "Template not found");
	}

	const response = await fetch(WORKFLOW_SERVICE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getAnonKey()}`,
		},
		body: JSON.stringify({
			event_type: "preview-ebook-site",
			content_number: formData.ebook_user_content_number,
			total_pages: content.storage_file_total_page,
			template_name: templateData.template_name,
		}),
	});

	const result = await response.json();

	if (result.status === "SUCCESS") {
		const { error: accessError } = await supabase
			.from("ebook_user_content_access")
			.insert({
				ebook_user_content_id: content.id,
				ebook_user_content_number: formData.ebook_user_content_number,
				auth_user_id: user.id,
				email_address: user.email,
				lynk_id_reference_id: null,
				storage_shard_name: content.storage_file_name.replace(
					".pdf",
					"",
				),
			});

		if (accessError) {
			console.error("Failed to create access record:", accessError);
		}

		return result;
	} else {
		throw new Error(result.error || "Failed to create preview");
	}
};
