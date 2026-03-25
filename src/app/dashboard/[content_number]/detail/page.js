import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookTemplateList } from "@/services/ebookTemplate/get";
import { getEbookUserContentByNumber } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import Detail from "./index";

export default async function EditEbookPage({ params }) {
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
		redirect("/dashboard");
	}

	const templates = await getEbookTemplateList();

	return (
		<Detail
			user={user}
			ebookUser={ebookUser}
			content={content}
			templates={templates}
			readOnly={content.is_published}
		/>
	);
}
