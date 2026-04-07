import { getAuthenticatedUser, getEbookUser } from "@/services/user/auth";
import { getEbookUserContentByNumber } from "@/services/userContent/get";
import { redirect } from "next/navigation";
import QuestionsDetail from ".";


export default async function TestPage({ params }) {

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
		<div className="min-h-screen bg-gray-50">
			<div className="">
				<div className="">
					<QuestionsDetail user={user} ebookUser={ebookUser} content={content} />
				</div>
			</div>
		</div>
	);
}
