"use client";

import { useState } from "react";
import { createPreview } from "@/services/userContent/workflow";
import { useModal } from "@/components/ModalProvider";

export default function PreviewTab({
	router,
	setError,
	formData,
	content,
	readOnly = false,
}) {
	const modal = useModal();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const hasPreview = !!content.ebook_template_preview_code;
	const canOpenPreview = readOnly || hasPreview;

	const handleCreatePreview = async () => {
		if (isSubmitting || readOnly) return;

		if (hasPreview) {
			const confirmed = await modal.confirm({
				message:
					"Are you sure you want to recreate the preview? This will overwrite the existing one.",
			});
			if (!confirmed) return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			await createPreview(formData);

			if (!hasPreview) {
				modal.show({
					type: "info",
					message: "Horray! Your preview is being created",
				});
			}

			router.refresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mb-xl">
			<h2 className="section-title">Preview</h2>

			{/* LOADER */}
			{isSubmitting && (
				<div className="loader-container">
					<div className="loader-spinner"></div>
					<p className="loader-text">
						Please wait until the creation of preview is done
					</p>
				</div>
			)}

			{/* OPEN PREVIEW */}
			{canOpenPreview && !isSubmitting && (
				<a
					href={`/dashboard/${content.ebook_user_content_number}/preview`}
					target="_blank"
					rel="noopener noreferrer"
					className="btn-success mr-2"
				>
					Open Preview
				</a>
			)}

			{/* CREATE BUTTON */}
			{!readOnly && !isSubmitting && (
				<button
					type="button"
					onClick={handleCreatePreview}
					className="btn-success"
				>
					{hasPreview ? "Recreate Preview" : "Create Preview"}
				</button>
			)}
		</div>
	);
}
