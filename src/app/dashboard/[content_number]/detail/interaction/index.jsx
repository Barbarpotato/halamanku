"use client";

import { useRouter } from "next/navigation";

// Components
import PageHeader from "@/components/body/PageHeader";
import TabActions from "../components/TabActions";
import TabNavigation from "../components/TabNavigation";
import Breadcrumb from "@/components/body/Breadcrumb";
import ClientStepperWrapper from "./components/ClientWrapper";

export default function QuestionsDetail({
	user,
	ebookUser,
	content,
	readOnly = false,
}) {
	const router = useRouter();

	const showDeleteButton = !content.is_published;
	const showPublishButton = content.is_published === false;

	return (
		<div className="page-container">
			<PageHeader user={user} ebookUser={ebookUser} showUserInfo={true} />

			<main className="main">
				<div className="page-header">
					<div>
						<Breadcrumb
							items={[
								{ label: "Dasbor", href: "/dashboard" },
								{
									label: "Interaksi",
								},
							]}
						/>

						<h1 className="page-header-title">Interaksi</h1>
					</div>

					<TabActions
						router={router}
						setError={() => {}}
						setLoading={() => {}}
						showPublishButton={showPublishButton}
						showDeleteButton={showDeleteButton}
						formData={{}}
						loading={false}
						content={{
							...content,
							ebook_user: ebookUser,
						}}
						readOnly={readOnly}
					/>
				</div>

				<TabNavigation content={content} />
				<ClientStepperWrapper
					user={user}
					ebookUser={ebookUser}
					content={content}
				/>
			</main>
		</div>
	);
}
