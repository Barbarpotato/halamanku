import EbookReader from "./EbookReader";
import { createClient } from "@/lib/supabase/client";

export default async function Page({ params }) {
	const { content_number, title } = await params;

	const supabase = createClient();

	const parsedContentNumber = decodeURIComponent(content_number);
	const parsedTitle = decodeURIComponent(title).replace(/-/g, " ");

	const { data, error } = await supabase
		.from("ebook_user_content")
		.select(
			"id, ebook_user_content_number, ebook_user_content_title, is_published, storage_file_total_page",
		)
		.eq("ebook_user_content_number", parsedContentNumber)
		.eq("ebook_user_content_title", parsedTitle)
		.eq("is_published", true)
		.single();

	// ❌ Content not found
	if (error || !data) {
		return (
			<div className="flex items-center justify-center h-screen">
				<h2>Content Not Found</h2>
			</div>
		);
	}

	// ❌ Not published
	if (!data.is_published) {
		return (
			<div className="flex items-center justify-center h-screen">
				<h2>Content Not Available</h2>
			</div>
		);
	}

	return (
		<EbookReader
			contentNumber={parsedContentNumber}
			totalPages={data.storage_file_total_page}
		/>
	);
}
