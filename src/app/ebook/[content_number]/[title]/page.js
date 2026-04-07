import EbookReader from ".";
import { createClient } from "@/lib/supabase/client";
import ErrorPage from "@/components/body/ErrorPage";
import { MdSearchOff } from "react-icons/md";

export default async function Page({ params }) {
	const { content_number, title } = await params;

	const supabase = createClient();

	const parsedContentNumber = decodeURIComponent(content_number);
	const parsedTitle = decodeURIComponent(title.replace(/\s+/g, "-"));

	const { data, error } = await supabase
		.from("ebook_user_content")
		.select("storage_file_total_page")
		.eq("ebook_user_content_number", parsedContentNumber)
		.single();

	// Content not found
	if (error || !data) {
		const notFoundIcon = (
			<MdSearchOff className="mx-auto h-24 w-24 text-gray-400" />
		);

		return (
			<ErrorPage
				icon={notFoundIcon}
				title="Konten Tidak Ditemukan"
				message="Maaf, konten yang Anda cari tidak tersedia atau telah dihapus."
				background="bg-gradient-to-br from-blue-50 to-indigo-100"
				buttonColor="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
			/>
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
