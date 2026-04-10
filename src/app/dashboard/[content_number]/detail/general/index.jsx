"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/modal/ModalProvider";
import dynamic from "next/dynamic";

// Services
import { updateEbookUserContent } from "@/services/userContent/update";

// Components
import PageHeader from "@/components/body/PageHeader";
import TabActions from "../components/TabActions";
import TabNavigation from "../components/TabNavigation";
const BasicInfoTab = dynamic(() => import("./components/BasicInfoTab"), {
	ssr: false,
});
import Breadcrumb from "@/components/body/Breadcrumb";

export default function GeneralDetail({
	user,
	ebookUser,
	content,
	readOnly = false,
}) {
	const router = useRouter();
	const modal = useModal();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		id: content.id || "",
		ebook_user_content_number: content.ebook_user_content_number || "",
		ebook_user_content_title: content.ebook_user_content_title || "",
		ebook_user_content_description:
			content.ebook_user_content_description || "",
		is_published: content.is_published || false,
		is_private: content.is_private || false,
	});

	const showDeleteButton = !content.is_published;
	const showPublishButton = content.is_published === false;

	const handleSave = async () => {
		setLoading(true);
		setError(null);

		try {
			await updateEbookUserContent(content.id, formData);
			router.refresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

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
									label: "Umum",
								},
							]}
						/>

						<h1 className="page-header-title">Umum</h1>
					</div>

					<TabActions
						router={router}
						setError={setError}
						setLoading={setLoading}
						showPublishButton={showPublishButton}
						showDeleteButton={showDeleteButton}
						formData={formData}
						loading={loading}
						content={{
							...content,
							ebook_user: ebookUser,
						}}
						readOnly={readOnly}
					/>
				</div>

				<TabNavigation content={content} />
				<form onSubmit={handleSave} className="form-card">
					{error && <div className="error-message">{error}</div>}

					<BasicInfoTab
						content={content}
						formData={formData}
						setFormData={setFormData}
						readOnly={readOnly}
						setError={setError}
						modal={modal}
						onSave={handleSave}
						loading={loading}
					/>
				</form>
			</main>
		</div>
	);
}
