import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookTemplateList } from "@/services/ebookTemplate/get";
import { getEbookUserContentById } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import EditEbookForm from "./EditEbookForm";

export default async function EditEbookPage({ params }) {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	const ebookUser = await getEbookUser(user.id);

	if (!ebookUser) {
		redirect("/login");
	}

	const { id } = params;
	const content = await getEbookUserContentById(id, ebookUser.id);

	if (!content) {
		redirect("/dashboard");
	}

	const templates = await getEbookTemplateList();

	return (
		<EditEbookForm
			user={user}
			ebookUser={ebookUser}
			content={content}
			templates={templates}
		/>
	);
}
