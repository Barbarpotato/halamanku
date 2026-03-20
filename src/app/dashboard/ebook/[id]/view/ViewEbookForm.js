"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Services
import { getWorkerStatuses, getLiveUrl } from "@/services/userContent/utils";

// Components
import PageHeader from "@/components/PageHeader";
import ViewBasicInfoTab from "./components/ViewBasicInfoTab";
import ViewPdfTab from "./components/ViewPdfTab";
import ViewPreviewTab from "./components/ViewPreviewTab";

export default function ViewEbookForm({ user, ebookUser, content, templates }) {
	const [activeTab, setActiveTab] = useState("basic");

	// Preview worker status - will be updated via polling
	const [previewWorkerStatus, setPreviewWorkerStatus] = useState(
		content.preview_worker_status || "IDLE",
	);

	// Single query for worker status with smart polling
	const { data: workerData } = useQuery({
		queryKey: ["ebookWorkerStatus", content.id],
		queryFn: async () => {
			return await getWorkerStatuses(content.id);
		},

		// Smart polling - stop when done
		refreshInterval: (data) => {
			if (!data) return 2000;
			const previewDone =
				data.preview === "SUCCESS" || data.preview === "FAILED";
			if (previewDone) return false;
			return 2000;
		},
	});

	// Update local preview state when polling returns new status
	useEffect(() => {
		if (!workerData) return;
		setPreviewWorkerStatus(workerData.preview);
	}, [workerData]);

	// Determine if we should show preview loader
	const showPreviewLoader =
		previewWorkerStatus !== "IDLE" &&
		previewWorkerStatus !== "SUCCESS" &&
		previewWorkerStatus !== "FAILED";

	// Preview tab: only visible if storage_file_name != null AND upload_worker_status == SUCCESS
	const showPreviewTab =
		content.storage_file_name != null &&
		content.upload_worker_status === "SUCCESS";

	const isPublished = content.is_published;

	// Check if content is LIVE
	const isLive =
		content.publish_worker_status === "SUCCESS" &&
		content.is_published === true;

	// Get the live URL
	const liveUrl = getLiveUrl(content, ebookUser);

	return (
		<div className="page-container">
			<PageHeader
				breadcrumb={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "View" },
				]}
			/>

			<main className="main">
				<div className="page-header">
					<div>
						<h1 className="page-header-title">View Ebook</h1>
						<p className="page-header-description">
							View ebook details
						</p>
					</div>

					{/* Status Badge */}
					<div className="flex-gap-md">
						{isPublished ? (
							<></>
						) : (
							<span className="badge badge-draft">Draft</span>
						)}

						{isLive && (
							<div className="live-info">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M22 4L12 14.01l-3-3"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>
									Your Content is Live.{" "}
									<a
										href={liveUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="live-link"
									>
										Click here to view
									</a>
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="form-card">
					{/* Tabs Navigation */}
					<div className="tabs-container">
						<button
							type="button"
							className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
							onClick={() => setActiveTab("basic")}
						>
							Basic Information
						</button>
						<button
							type="button"
							className={`tab-button ${activeTab === "pdf" ? "active" : ""}`}
							onClick={() => setActiveTab("pdf")}
						>
							PDF
						</button>
						{showPreviewTab && (
							<button
								type="button"
								className={`tab-button ${activeTab === "preview" ? "active" : ""}`}
								onClick={() => setActiveTab("preview")}
							>
								Preview
							</button>
						)}
					</div>

					{/* Basic Information Tab */}
					<div
						className={`tab-content ${activeTab === "basic" ? "active" : ""}`}
					>
						<ViewBasicInfoTab
							isActive={activeTab === "basic"}
							content={content}
							templates={templates}
						/>
					</div>

					{/* PDF Tab */}
					<div
						className={`tab-content ${activeTab === "pdf" ? "active" : ""}`}
					>
						<ViewPdfTab
							isActive={activeTab === "pdf"}
							content={content}
						/>
					</div>

					{/* Preview Tab */}
					{showPreviewTab && (
						<div
							className={`tab-content ${activeTab === "preview" ? "active" : ""}`}
						>
							<ViewPreviewTab
								isActive={activeTab === "preview"}
								contentId={content.id}
								previewWorkerStatus={previewWorkerStatus}
								showPreviewLoader={showPreviewLoader}
							/>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
