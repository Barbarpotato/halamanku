import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookTemplateList } from "@/services/ebookTemplate/get";
import { redirect } from "next/navigation";
import New from "./index";

export default async function NewEbookPage() {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	const ebookUser = await getEbookUser(user.id);

	if (!ebookUser) {
		redirect("/login");
	}

	const templates = await getEbookTemplateList();

	return <New user={user} ebookUser={ebookUser} templates={templates} />;
}
