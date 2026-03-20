import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookUserContentList } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	const ebookUser = await getEbookUser(user.id);

	if (!ebookUser) {
		redirect("/login");
	}

	const userContents = await getEbookUserContentList(ebookUser.id);

	return (
		<DashboardContent
			user={user}
			ebookUser={ebookUser}
			userContents={userContents}
		/>
	);
}
