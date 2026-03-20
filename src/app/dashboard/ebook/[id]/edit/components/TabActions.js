"use client";

import { useState } from "react";

export default function TabActions({
	showPublishButton,
	showDeleteButton,
	formData,
	loading,
	isPublished,
	creatingPreview,
	onPublish,
	onCreatePreview,
	onDelete,
	publishing,
	publishWorkerStatus,
	workerData,
	content,
	user,
}) {
	const [menuOpen, setMenuOpen] = useState(false);

	// Check if any dropdown item is available
	const hasDropdownItems = showPublishButton || showDeleteButton;

	// Check if content is LIVE (published successfully)
	const isLive =
		workerData?.publish === "SUCCESS" && content?.is_published === true;

	// Get the live URL - use ebook_user_content_number and convert whitespace to hyphens for the URL
	const getLiveUrl = () => {
		if (
			!content?.ebook_user_content_number ||
			!content?.ebook_user_content_title ||
			!content?.ebook_user?.user_number
		) {
			return null;
		}
		const contentNumber = content.ebook_user_content_number;
		const title = content.ebook_user_content_title.replace(/\s+/g, "-");
		return `/live/${encodeURIComponent(contentNumber)}/${encodeURIComponent(title)}`;
	};

	return (
		<div className="header-actions">
			{/* LIVE content information */}
			{isLive ? (
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
							href={getLiveUrl()}
							target="_blank"
							rel="noopener noreferrer"
							className="live-link"
						>
							Click here to view
						</a>
					</span>
				</div>
			) : (
				/* Three dots dropdown menu */
				hasDropdownItems && (
					<div className="dropdown">
						<button
							type="button"
							className="menu-btn"
							onClick={() => setMenuOpen(!menuOpen)}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<circle cx="12" cy="5" r="2" />
								<circle cx="12" cy="12" r="2" />
								<circle cx="12" cy="19" r="2" />
							</svg>
						</button>

						{menuOpen && (
							<div className="dropdown-menu">
								{showPublishButton && (
									<button
										type="button"
										onClick={() => {
											onPublish();
											setMenuOpen(false);
										}}
										disabled={
											loading ||
											formData.is_published ||
											publishing ||
											publishWorkerStatus ===
												"PROCESSING" ||
											creatingPreview
										}
										className="dropdown-item"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M5 12l5 5L20 7"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										{formData.is_published
											? "Published"
											: "Publish"}
									</button>
								)}

								{showDeleteButton && (
									<button
										type="button"
										onClick={() => {
											onDelete();
											setMenuOpen(false);
										}}
										disabled={
											loading ||
											isPublished ||
											publishing ||
											publishWorkerStatus ===
												"PROCESSING" ||
											creatingPreview
										}
										className="dropdown-item"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										Delete
									</button>
								)}
							</div>
						)}
					</div>
				)
			)}
		</div>
	);
}
