import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookUserContentByNumber } from "@/services/userContent/get";
import { getEbookTemplateById } from "@/services/ebookTemplate/get";
import { redirect } from "next/navigation";
import Preview from "./index";

export default async function PreviewPage({ params }) {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	const ebookUser = await getEbookUser(user.id);

	if (!ebookUser) {
		redirect("/login");
	}

	const { content_number } = await params;
	const content = await getEbookUserContentByNumber(
		content_number,
		ebookUser.id,
	);

	if (!content) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<h1>Content not found</h1>
				<a href="/dashboard">Go back to dashboard</a>
			</div>
		);
	}

	// Get the template data if available
	let template = null;
	if (content.ebook_template_id) {
		template = await getEbookTemplateById(content.ebook_template_id);
	}

	return <Preview content={content} template={template} />;
}
