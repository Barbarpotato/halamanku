"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../../new/new.module.css";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

export default function EditEbookForm({ user, ebookUser, content, templates }) {
	const router = useRouter();
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const fileInputRef = useRef(null);

	// PDF file state
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfPath, setPdfPath] = useState(
		content.supabase_file_storage_url || "",
	);
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState(null);

	const [formData, setFormData] = useState({
		ebook_template_id: content.ebook_template_id || "",
		ebook_user_content_number: content.ebook_user_content_number || "",
		ebook_user_content_title: content.ebook_user_content_title || "",
		ebook_user_content_description:
			content.ebook_user_content_description || "",
		template_primary_background_color:
			content.template_primary_background_color || "#FFFFFF",
		template_secondary_background_color:
			content.template_secondary_background_color || "#F8F9FA",
		template_text_color: content.template_text_color || "#1E293B",
		template_heading_text: content.template_heading_text || "",
		template_preview_code: content.ebook_template_preview_code || "",
		is_published: content.is_published || false,
	});

	// Check if ebook is already published
	const isPublished = formData.is_published;

	// Helper function to update CSS variables in the template HTML
	const updateCssVariables = (
		htmlCode,
		primaryBg,
		secondaryBg,
		textColor,
		headingText,
	) => {
		if (!htmlCode) return htmlCode;

		let updatedHtml = htmlCode;

		// Update primary-background-color
		updatedHtml = updatedHtml.replace(
			/--primary-background-color:\s*[^;]+;/g,
			`--primary-background-color: ${primaryBg};`,
		);

		updatedHtml = updatedHtml.replace(
			/--secondary-background-color:\s*[^;]+;/g,
			`--secondary-background-color: ${secondaryBg};`,
		);

		// Update text-color
		updatedHtml = updatedHtml.replace(
			/--text-color:\s*[^;]+;/g,
			`--text-color: ${textColor};`,
		);

		// Update heading in APP_CONFIG
		if (headingText) {
			updatedHtml = updatedHtml.replace(
				/HEADING:\s*["'][^"']*["']/g,
				`HEADING: "${headingText}"`,
			);

			updatedHtml = updatedHtml.replace(
				/TITLE:\s*["'][^"']*["']/g,
				`TITLE: "${headingText}"`,
			);
		}

		return updatedHtml;
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// If color fields or heading text change, update the CSS variables in template_preview_code
		if (
			name === "template_primary_background_color" ||
			name === "template_secondary_background_color" ||
			name === "template_text_color" ||
			name === "template_heading_text"
		) {
			const newPrimaryBg =
				name === "template_primary_background_color"
					? value
					: formData.template_primary_background_color;
			const newSecondaryBg =
				name === "template_secondary_background_color"
					? value
					: formData.template_secondary_background_color;
			const newTextColor =
				name === "template_text_color"
					? value
					: formData.template_text_color;
			const newHeadingText =
				name === "template_heading_text"
					? value
					: formData.template_heading_text;

			const updatedPreviewCode = updateCssVariables(
				formData.template_preview_code,
				newPrimaryBg,
				newSecondaryBg,
				newTextColor,
				newHeadingText,
			);

			setFormData((prev) => ({
				...prev,
				[name]: value,
				template_preview_code: updatedPreviewCode,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	// Handle file selection
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.type !== "application/pdf") {
				setPdfError("Only PDF files are allowed");
				return;
			}
			setPdfFile(file);
			setPdfError(null);
		}
	};

	// Get the anon key from environment
	const getAnonKey = () => {
		return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	};

	// Upload new PDF
	const handleUploadPdf = async () => {
		if (!pdfFile) {
			setPdfError("Please select a file first");
			return;
		}

		setPdfLoading(true);
		setPdfError(null);

		try {
			const formData = new FormData();
			formData.append("file", pdfFile);

			const response = await fetch(STORAGE_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${getAnonKey()}`,
				},
				body: formData,
			});

			const result = await response.json();

			if (result.status === "SUCCESS") {
				const path = result.data.path;
				setPdfPath(path);
				// Save the path to database
				await supabase
					.from("ebook_user_content")
					.update({ supabase_file_storage_url: path })
					.eq("id", content.id);
				setPdfFile(null);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			} else {
				throw new Error(result.error || "Upload failed");
			}
		} catch (err) {
			setPdfError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	// Update existing PDF
	const handleUpdatePdf = async () => {
		if (!pdfFile || !pdfPath) {
			setPdfError("No existing file to update");
			return;
		}

		setPdfLoading(true);
		setPdfError(null);

		try {
			const formData = new FormData();
			formData.append("file", pdfFile);
			formData.append("path", pdfPath);

			const response = await fetch(STORAGE_URL, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${getAnonKey()}`,
				},
				body: formData,
			});

			const result = await response.json();

			if (result.status === "SUCCESS") {
				setPdfFile(null);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			} else {
				throw new Error(result.error || "Update failed");
			}
		} catch (err) {
			setPdfError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	// Delete PDF
	const handleDeletePdf = async () => {
		if (!pdfPath) {
			setPdfError("No file to delete");
			return;
		}

		if (!confirm("Are you sure you want to delete this PDF?")) return;

		setPdfLoading(true);
		setPdfError(null);

		try {
			const formData = new FormData();
			formData.append("path", pdfPath);

			const response = await fetch(STORAGE_URL, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${getAnonKey()}`,
				},
				body: formData,
			});

			const result = await response.json();

			if (result.status === "SUCCESS") {
				setPdfPath("");
				await supabase
					.from("ebook_user_content")
					.update({ supabase_file_storage_url: null })
					.eq("id", content.id);
			} else {
				throw new Error(result.error || "Delete failed");
			}
		} catch (err) {
			setPdfError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	// Get signed URL
	const handleGetPdfUrl = async () => {
		if (!pdfPath) {
			setPdfError("No file to view");
			return;
		}

		setPdfLoading(true);
		setPdfError(null);

		try {
			const url = `${STORAGE_URL}?path=${encodeURIComponent(pdfPath)}`;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${getAnonKey()}`,
				},
			});

			const result = await response.json();

			if (result.status === "SUCCESS") {
				// Open the signed URL in a new tab
				window.open(result.data.signedUrl, "_blank");
			} else {
				throw new Error(result.error || "Failed to get URL");
			}
		} catch (err) {
			setPdfError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const updateData = {
				ebook_template_id: formData.ebook_template_id || null,
				ebook_user_content_number: formData.ebook_user_content_number,
				ebook_user_content_title: formData.ebook_user_content_title,
				ebook_user_content_description:
					formData.ebook_user_content_description,
				template_primary_background_color:
					formData.template_primary_background_color,
				template_secondary_background_color:
					formData.template_secondary_background_color,
				template_text_color: formData.template_text_color,
				template_heading_text: formData.template_heading_text,
				ebook_template_preview_code: formData.template_preview_code,
				is_published: formData.is_published,
			};

			// Handle published date
			if (formData.is_published !== content.is_published) {
				updateData.published_date = formData.is_published
					? new Date().toISOString()
					: null;
			}

			const { error: updateError } = await supabase
				.from("ebook_user_content")
				.update(updateData)
				.eq("id", content.id);

			if (updateError) {
				throw updateError;
			}

			router.refresh();
			alert("Ebook updated successfully!");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this ebook?")) return;

		setLoading(true);
		setError(null);

		try {
			// Check if there's a PDF file to delete from storage
			if (content.supabase_file_storage_url) {
				const formData = new FormData();
				formData.append("path", content.supabase_file_storage_url);

				const response = await fetch(STORAGE_URL, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${getAnonKey()}`,
					},
					body: formData,
				});

				const result = await response.json();

				if (result.status !== "SUCCESS") {
					// Log error but continue with database deletion
					console.error(
						"Failed to delete file from storage:",
						result.error,
					);
				}
			}

			// Delete the database record
			const { error: deleteError } = await supabase
				.from("ebook_user_content")
				.delete()
				.eq("id", content.id);

			if (deleteError) {
				throw deleteError;
			}

			router.push("/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Publish ebook
	const handlePublish = async () => {
		if (!confirm("Are you sure you want to publish this ebook?")) return;

		setLoading(true);
		setError(null);

		try {
			const { error: publishError } = await supabase
				.from("ebook_user_content")
				.update({
					is_published: true,
					published_date: new Date().toISOString(),
				})
				.eq("id", content.id);

			if (publishError) {
				throw publishError;
			}

			// Update local state
			setFormData((prev) => ({
				...prev,
				is_published: true,
			}));

			router.refresh();
			alert("Ebook published successfully!");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.logo}>
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>Ebook Admin</span>
					</div>
					<div className={styles.breadcrumb}>
						<a href="/dashboard">Dashboard</a>
						<span>/</span>
						<span>Edit</span>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<div>
						<h1>Edit Ebook</h1>
						<p>Update your ebook details</p>
					</div>
					<div className={styles.headerActions}>
						<button
							type="button"
							onClick={handlePublish}
							className={styles.publishBtn}
							disabled={loading || formData.is_published}
						>
							{formData.is_published ? "Published" : "Publish"}
						</button>
					</div>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<input
						type="hidden"
						name="template_preview_code"
						value={formData.template_preview_code}
					/>

					<div className={styles.section}>
						<h2>Basic Information</h2>
						<div className={styles.grid}>
							<div className={styles.field}>
								<label htmlFor="ebook_template_id">
									Template
								</label>
								<select
									id="ebook_template_id"
									name="ebook_template_id"
									value={formData.ebook_template_id}
									onChange={handleChange}
								>
									<option value="">Select a template</option>
									{templates.map((template) => (
										<option
											key={template.id}
											value={template.id}
										>
											{template.template_name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_title">
								Title
							</label>
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Enter ebook title"
								disabled={isPublished}
							/>
						</div>
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_description">
								Description
							</label>
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								placeholder="Enter ebook description"
								disabled={isPublished}
							/>
						</div>
					</div>

					<div className={styles.section}>
						<h2>Template Styling</h2>
						<div className={styles.grid}>
							<div className={styles.field}>
								<label htmlFor="template_primary_background_color">
									Primary Background
								</label>
								<div className={styles.colorInput}>
									<input
										type="color"
										id="template_primary_background_color"
										name="template_primary_background_color"
										value={
											formData.template_primary_background_color
										}
										disabled={isPublished}
										onChange={handleChange}
									/>
									<input
										type="text"
										value={
											formData.template_primary_background_color
										}
										onChange={handleChange}
										disabled={isPublished}
										name="template_primary_background_color"
									/>
								</div>
							</div>
							<div className={styles.field}>
								<label htmlFor="template_secondary_background_color">
									Secondary Background
								</label>
								<div className={styles.colorInput}>
									<input
										type="color"
										id="template_secondary_background_color"
										name="template_secondary_background_color"
										value={
											formData.template_secondary_background_color
										}
										disabled={isPublished}
										onChange={handleChange}
									/>
									<input
										type="text"
										value={
											formData.template_secondary_background_color
										}
										disabled={isPublished}
										onChange={handleChange}
										name="template_secondary_background_color"
									/>
								</div>
							</div>
							<div className={styles.field}>
								<label htmlFor="template_text_color">
									Text Color
								</label>
								<div className={styles.colorInput}>
									<input
										type="color"
										id="template_text_color"
										name="template_text_color"
										value={formData.template_text_color}
										onChange={handleChange}
										disabled={isPublished}
									/>
									<input
										type="text"
										value={formData.template_text_color}
										onChange={handleChange}
										disabled={isPublished}
										name="template_text_color"
									/>
								</div>
							</div>
						</div>
						<div className={styles.field}>
							<label htmlFor="template_heading_text">
								Heading Text
							</label>
							<input
								type="text"
								id="template_heading_text"
								name="template_heading_text"
								value={formData.template_heading_text}
								onChange={handleChange}
								placeholder="Enter heading text"
								disabled={isPublished}
							/>
						</div>
					</div>

					<div className={styles.section}>
						<h2>PDF File</h2>
						{pdfError && (
							<div
								className={styles.error}
								style={{ marginBottom: "16px" }}
							>
								{pdfError}
							</div>
						)}
						<div className={styles.field}>
							<label htmlFor="pdf_file">
								{pdfPath
									? "Replace PDF File"
									: "Upload PDF File"}
							</label>
							<input
								type="file"
								id="pdf_file"
								ref={fileInputRef}
								accept=".pdf"
								onChange={handleFileChange}
								disabled={isPublished}
								className={styles.fileInput}
							/>
						</div>
						<div className={styles.pdfActions}>
							{pdfPath ? (
								<>
									<button
										type="button"
										onClick={handleGetPdfUrl}
										disabled={pdfLoading}
										className={styles.viewBtn}
									>
										{pdfLoading ? "Loading..." : "View PDF"}
									</button>
									{pdfFile && (
										<button
											type="button"
											onClick={handleUpdatePdf}
											disabled={pdfLoading}
											className={styles.updateBtn}
										>
											{pdfLoading
												? "Updating..."
												: "Update PDF"}
										</button>
									)}
									<button
										type="button"
										onClick={handleDeletePdf}
										disabled={pdfLoading}
										className={styles.deletePdfBtn}
									>
										{pdfLoading
											? "Deleting..."
											: "Delete PDF"}
									</button>
								</>
							) : (
								<button
									type="button"
									onClick={handleUploadPdf}
									disabled={pdfLoading || !pdfFile}
									className={styles.uploadBtn}
								>
									{pdfLoading ? "Uploading..." : "Upload PDF"}
								</button>
							)}
						</div>
						{pdfPath && (
							<div className={styles.pdfPath}>
								<small>Current file: {pdfPath}</small>
							</div>
						)}
					</div>

					<div className={styles.section}>
						<h2>Preview</h2>
						<a
							href={`/dashboard/ebook/${content.id}/preview`}
							target="_blank"
							rel="noopener noreferrer"
							className={styles.previewBtn}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Open Preview
						</a>
					</div>

					<div className={styles.actions}>
						<button
							type="button"
							onClick={handleDelete}
							className={styles.deleteBtn}
							disabled={loading || isPublished}
						>
							Delete
						</button>
						<div className={styles.rightActions}>
							<button
								type="submit"
								disabled={loading || isPublished}
								className={styles.submitBtn}
							>
								{loading ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>
				</form>
			</main>
		</div>
	);
}
