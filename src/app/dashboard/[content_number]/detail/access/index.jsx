"use client";

import { useRouter } from "next/navigation";
import { useModal } from "@/components/modal/ModalProvider";

// Components
import PageHeader from "@/components/body/PageHeader";
import TabActions from "../components/TabActions";
import TabNavigation from "../components/TabNavigation";
import AccessTab from "./components/AccessTab";
import Breadcrumb from "@/components/body/Breadcrumb";

export default function AccessDetail({
	user,
	ebookUser,
	content,
	readOnly = false,
}) {
	const router = useRouter();
	const modal = useModal();

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
									label: "Akses",
								},
							]}
						/>

						<h1 className="page-header-title">Akses</h1>
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
				<div className="form-card">
					<AccessTab
						content={content}
						readOnly={readOnly}
						modal={modal}
					/>
				</div>
			</main>
		</div>
	);
}
