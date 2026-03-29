import { createClient } from "@/lib/supabase/client";
import { STORAGE_URL } from "@/lib/supabase";

const supabase = createClient();

// Helper to get anon key
const getAnonKey = () => {
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const updateEbookUserContent = async (contentId, formData) => {
	const updateData = {
		ebook_user_content_number: formData.ebook_user_content_number,
		ebook_user_content_title: formData.ebook_user_content_title,
		ebook_user_content_description: formData.ebook_user_content_description,
		template_primary_background_color:
			formData.template_primary_background_color,
		template_secondary_background_color:
			formData.template_secondary_background_color,
		template_text_color: formData.template_text_color,
		template_heading_text: formData.template_heading_text,
		is_published: formData.is_published,
	};

	const { error: updateError } = await supabase
		.from("ebook_user_content")
		.update(updateData)
		.eq("id", contentId)
		.eq("is_published", false);

	if (updateError) {
		throw updateError;
	}
};

export const publishEbookUserContent = async (formData) => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("User not authenticated");
	}
	// need to check the upload_worker_status before updating is_published
	const { data: isUploadWorkerDone, error: isUploadWorkerDoneError } =
		await supabase
			.from("ebook_user_content")
			.select("upload_worker_status")
			.eq("ebook_user_content_number", formData.ebook_user_content_number)
			.single();

	if (isUploadWorkerDoneError) {
		throw isUploadWorkerDoneError;
	}

	if (isUploadWorkerDone.upload_worker_status === "FAILED") {
		// **
		// retry the upload worker logic!
		const { error: updateWorkerStatusError } = await supabase
			.from("ebook_user_content")
			.update({
				upload_worker_status: "PROCESSING",
			})
			.eq(
				"ebook_user_content_number",
				formData.ebook_user_content_number,
			);

		if (updateWorkerStatusError) {
			throw updateWorkerStatusError;
		}

		// **
		// send a webhook to the upload worker to retry the upoad worker
		const uploadWorkerFormdata = new FormData();
		uploadWorkerFormdata.append("id", formData.id);
		uploadWorkerFormdata.append("triggerUploadWorkerOnly", "true");

		const response = await fetch(STORAGE_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${getAnonKey()}`,
			},
			body: uploadWorkerFormdata,
		});

		const result = await response.json();

		if (result.status === "SUCCESS") {
			throw new Error(
				"Konten Anda sedang diproses. Silakan coba lagi dalam beberapa menit."
			);
		} else {
			throw new Error(result.error || "Upload failed");
		}
	}

	if (isUploadWorkerDone.upload_worker_status !== "SUCCESS") {
		throw new Error(
			"Konten Anda sedang diproses. Silakan coba lagi dalam beberapa menit."
		);
	}

	const { error: publishError } = await supabase
		.from("ebook_user_content")
		.update({
			is_published: true,
			published_date: new Date().toISOString(),
		})
		.eq("ebook_user_content_number", formData.ebook_user_content_number);

	if (publishError) {
		throw publishError;
	}

	return true;
};
