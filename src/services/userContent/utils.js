import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const getLiveUrl = (content, ebookUser) => {
	if (
		!content?.ebook_user_content_number ||
		!content?.ebook_user_content_title ||
		!ebookUser
	) {
		return null;
	}
	const contentNumber = content.ebook_user_content_number;
	const title = content.ebook_user_content_title.replace(/\s+/g, "-");
	return `/live/${encodeURIComponent(contentNumber)}/${encodeURIComponent(title)}`;
};

export const getWorkerStatuses = async (contentId) => {
	const { data, error } = await supabase
		.from("ebook_user_content")
		.select(
			"upload_worker_status, preview_worker_status, publish_worker_status",
		)
		.eq("id", contentId)
		.single();

	if (error) return null;

	return {
		upload: data.upload_worker_status || "IDLE",
		preview: data.preview_worker_status || "IDLE",
		publish: data.publish_worker_status || "IDLE",
	};
};
