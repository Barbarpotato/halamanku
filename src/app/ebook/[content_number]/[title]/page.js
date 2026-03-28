import EbookReader from "./EbookReader";
import { createClient } from "@/lib/supabase/client";

export default async function Page({ params }) {
	const { content_number, title } = await params;

	const supabase = createClient();

	const parsedContentNumber = decodeURIComponent(content_number);
	const parsedTitle = decodeURIComponent(title.replace(/\s+/g, "-"));

	const { data, error } = await supabase
		.from("ebook_user_content")
		.select(
			"storage_file_total_page",
		)
		.eq("ebook_user_content_number", parsedContentNumber)
		.single();

	// Content not found
	if (error || !data) {
		return (
			<div className="flex items-center justify-center h-screen">
				<h2>Content Not Found</h2>
			</div>
		);
	}

	return (
		<EbookReader
			contentNumber={parsedContentNumber}
			title={parsedTitle}
			totalPages={data.storage_file_total_page}
		/>
	);
}
