"use client";

import dynamic from "next/dynamic";

const VerticalStepper = dynamic(() => import("./VerticalStepper"), {
	ssr: false,
});

export default function ClientStepperWrapper({
	user,
	ebookUser,
	content,
	reactions,
	questions,
}) {
	return (
		<VerticalStepper
			totalPages={content.storage_file_total_page}
			contentNumber={content.ebook_user_content_number}
			content={content}
			reactions={reactions}
			questions={questions}
		/>
	);
}
