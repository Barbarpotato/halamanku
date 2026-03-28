"use client";

import { useModal } from "@/components/ModalProvider";
import { useState } from "react";
import { getLiveUrl } from "@/services/userContent/utils";

// Services
import { publishEbookUserContent } from "@/services/userContent/update";
import { deleteEbookUserContent } from "@/services/userContent/delete";

export default function TabActions({
	router,
	setError,
	setLoading,
	showPublishButton,
	showDeleteButton,
	formData,
	loading,
	content,
	readOnly = false,
}) {
	const modal = useModal();

	const [menuOpen, setMenuOpen] = useState(false);

	// Check if any dropdown item is available
	const hasDropdownItems =
		!readOnly && (showPublishButton || showDeleteButton);

	const isPublished = content.is_published === true;

	// Check if content is LIVE (published successfully)
	const isLive = content?.is_published === true;

	// Get the live URL
	const liveUrl = getLiveUrl(content, content?.ebook_user);

	const handleDelete = async () => {
		const result = await modal.confirm({
			message: "Are you sure you want to delete this ebook?",
		});
		if (!result) return;

		setLoading(true);
		setError(null);

		try {
			await deleteEbookUserContent(content);
			router.push("/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePublish = async () => {
		const result = await modal.confirm({
			message: "Are you sure you want to publish this ebook?",
		});
		if (!result) return;

		setLoading(true);
		setError(null);

		try {
			await publishEbookUserContent(formData);
			modal.show({
				type: "info",
				message:
					"Ebook is being published. Please Wait for a while to see your page",
			});
			router.refresh();
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
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
					<span className="flex flex-col sm:flex-row items-start sm:items-center">
						<span className="hidden sm:inline">
							Your Content is Live.{" "}
						</span>
						<a
							href={liveUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="live-link text-blue-600 hover:text-blue-800 underline"
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
											handlePublish();
											setMenuOpen(false);
										}}
										disabled={
											loading || formData.is_published
										}
										className="dropdown-item flex"
									>
										<svg
											className="mr-2"
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
											handleDelete();
											setMenuOpen(false);
										}}
										disabled={loading || isPublished}
										className="dropdown-item flex"
									>
										<svg
											className="mr-2"
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
