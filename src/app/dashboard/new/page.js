import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
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

	return <New user={user} ebookUser={ebookUser} templates={[]} />;
}
