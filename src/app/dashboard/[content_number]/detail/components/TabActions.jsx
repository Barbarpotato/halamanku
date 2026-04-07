"use client";

import { useModal } from "@/components/modal/ModalProvider";
import { useState } from "react";
import { getLiveUrl } from "@/services/userContent/utils";
import { MdCheckCircle, MdMoreVert, MdCheck, MdDelete } from "react-icons/md";

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
			message: "Apakah Anda yakin ingin menghapus ebook ini?",
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
			message: "Apakah Anda yakin ingin mempublikasikan ebook ini?",
		});
		if (!result) return;

		setLoading(true);
		setError(null);

		try {
			await publishEbookUserContent(formData);
			modal.show({
				type: "info",
				message:
					"Ebook sedang dipublikasikan. Harap tunggu sebentar untuk melihat halaman Anda",
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
					<MdCheckCircle size={20} />
					<span className="flex flex-col sm:flex-row items-start sm:items-center">
						<span className="hidden sm:inline">
							Konten telah terpublikasi.
						</span>
						<a
							href={liveUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="ml-1 live-link text-blue-600 hover:text-blue-800 underline"
						>
							Klik untuk melihat
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
							<MdMoreVert size={20} />
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
										<MdCheck className="mr-2" size={16} />
										{formData.is_published
											? "Diterbitkan"
											: "Publikasikan"}
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
										<MdDelete className="mr-2" size={16} />
										Hapus
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
