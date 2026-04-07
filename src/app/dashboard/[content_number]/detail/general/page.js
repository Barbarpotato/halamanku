import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookUserContentByNumber } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import Detail from "./index";

export default async function EditEbookPage({ params }) {
	const user = await getAuthenticatedUser();
	const ebookUser = await getEbookUser(user.id);
	const { content_number } = await params;
	const content = await getEbookUserContentByNumber(
		content_number,
		ebookUser.id,
	);

	if (!content) {
		redirect("/dashboard");
	}

	return (
		<Detail
			user={user}
			ebookUser={ebookUser}
			content={content}
			templates={[]}
			readOnly={content.is_published}
		/>
	);
}
