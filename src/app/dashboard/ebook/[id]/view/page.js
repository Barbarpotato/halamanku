import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookTemplateList } from "@/services/ebookTemplate/get";
import { getEbookUserContentById } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import ViewEbookForm from "./ViewEbookForm";

export default async function ViewEbookPage({ params }) {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	const ebookUser = await getEbookUser(user.id);

	if (!ebookUser) {
		redirect("/login");
	}

	const { id } = await params;
	const content = await getEbookUserContentById(id, ebookUser.id);

	if (!content) {
		redirect("/dashboard");
	}

	const templates = await getEbookTemplateList();

	return (
		<ViewEbookForm
			user={user}
			ebookUser={ebookUser}
			content={content}
			templates={templates}
		/>
	);
}
