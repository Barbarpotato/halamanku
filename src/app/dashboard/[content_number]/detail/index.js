"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useModal } from "@/components/ModalProvider";

// Services
import { updateEbookUserContent } from "@/services/userContent/update";
import { getWorkerStatuses } from "@/services/userContent/utils";

// Components
import PageHeader from "@/components/PageHeader";
import TabActions from "./components/TabActions";
import BasicInfoTab from "./components/BasicInfoTab";
import PdfTab from "./components/PdfTab";
import AccessTab from "./components/AccessTab";
import Breadcrumb from "@/components/Breadcrumb";

export default function Detail({
	user,
	ebookUser,
	content,
	templates,
	readOnly = false,
}) {
	const router = useRouter();
	const modal = useModal();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Tab state
	const [activeTab, setActiveTab] = useState("basic");
	const [hasOverflow, setHasOverflow] = useState(false);
	const tabsRef = useRef(null);

	const [formData, setFormData] = useState({
		id: content.id || "",
		ebook_user_content_number: content.ebook_user_content_number || "",
		ebook_user_content_title: content.ebook_user_content_title || "",
		ebook_user_content_description:
			content.ebook_user_content_description || "",
		is_published: content.is_published || false,
	});

	// Check for tab overflow
	useEffect(() => {
		const checkOverflow = () => {
			if (tabsRef.current) {
				const { scrollWidth, clientWidth } = tabsRef.current;
				setHasOverflow(scrollWidth > clientWidth);
			}
		};

		checkOverflow();
		window.addEventListener("resize", checkOverflow);

		return () => window.removeEventListener("resize", checkOverflow);
	}, []);

	// Determine if delete button should be visible
	const showDeleteButton = !content.is_published;

	// Publish button: only visible if PDF exists (storage_file_name is not null)
	const showPublishButton = content.is_published === false;

	const handleSubmit = async (e) => {
		e.preventDefault();
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
								{ label: "Dashboard", href: "/dashboard" },
								{
									label: "Detail",
								},
							]}
						/>

						<h1 className="page-header-title">Detail</h1>
					</div>

					{/* Header Actions: Delete, Publish */}
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

				<form onSubmit={handleSubmit} className="form-card">
					{error && <div className="error-message">{error}</div>}

					{/* Tabs Navigation */}
					<div
						ref={tabsRef}
						className={`tabs-container ${hasOverflow ? "has-overflow" : ""}`}
					>
						<button
							type="button"
							className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
							onClick={() => setActiveTab("basic")}
						>
							General
						</button>
						<button
							type="button"
							className={`tab-button ${activeTab === "pdf" ? "active" : ""}`}
							onClick={() => setActiveTab("pdf")}
						>
							PDF
						</button>

						{content.is_published == true && (
							<button
								type="button"
								className={`tab-button ${activeTab === "access" ? "active" : ""}`}
								onClick={() => setActiveTab("access")}
							>
								Access
							</button>
						)}

						{hasOverflow && (
							<div className="scroll-indicator">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9 18l6-6-6-6"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						)}
					</div>

					{/* Tab Contents */}
					<div
						className={`tab-content ${activeTab === "basic" ? "active" : ""}`}
					>
						<BasicInfoTab
							content={content}
							formData={formData}
							setFormData={setFormData}
							templates={templates}
							readOnly={readOnly}
						/>
						{!readOnly && (
							<div className="actions-row">
								<button
									type="submit"
									disabled={loading}
									className="btn-primary"
								>
									{loading ? "Loading..." : "Save Changes"}
								</button>
							</div>
						)}
					</div>

					<div
						className={`tab-content ${activeTab === "pdf" ? "active" : ""}`}
					>
						<PdfTab
							setError={setError}
							content={content}
							readOnly={readOnly}
						/>
					</div>

					<div
						className={`tab-content ${activeTab === "access" ? "active" : ""}`}
					>
						<AccessTab
							content={content}
							readOnly={readOnly}
							modal={modal}
						/>
					</div>
				</form>
			</main>
		</div>
	);
}
