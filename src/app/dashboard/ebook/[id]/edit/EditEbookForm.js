"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
	const [pdfPath, setPdfPath] = useState(content.storage_file_name || "");
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState(null);

	// Upload worker status - will be updated via polling
	const [uploadWorkerStatus, setUploadWorkerStatus] = useState(
		content.upload_worker_status || "IDLE",
	);

	// Poll for upload worker status
	const { data: statusData, isLoading: statusLoading } = useQuery({
		queryKey: ["uploadWorkerStatus", content.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("ebook_user_content")
				.select("upload_worker_status")
				.eq("id", content.id)
				.single();

			if (error) {
				return null;
			}

			return data?.upload_worker_status || "IDLE";
		},
		refetchInterval: 2000, // Poll every 2 seconds
		enabled:
			uploadWorkerStatus !== "SUCCESS" || uploadWorkerStatus !== "FAILED",
	});

	// Update local state when polling returns new status
	useEffect(() => {
		if (statusData) {
			setUploadWorkerStatus(statusData);
		}
	}, [statusData]);

	// Determine if we should show loader (not IDLE or SUCCESS)
	const showLoader =
		uploadWorkerStatus !== "IDLE" && uploadWorkerStatus !== "SUCCESS";

	// Determine if delete button should be visible
	const showActionButton =
		uploadWorkerStatus === "IDLE" || uploadWorkerStatus === "SUCCESS";

	const [formData, setFormData] = useState({
		ebook_template_id: content.ebook_template_id || "",
		ebook_user_content_number: content.ebook_user_content_number || "",
		ebook_user_content_title: content.ebook_user_content_title || "",
		ebook_user_content_description:
			content.ebook_user_content_description || "",
		template_preview_code: content.ebook_template_preview_code || "",
		is_published: content.is_published || false,
	});

	// Check if ebook is already published
	const isPublished = formData.is_published;

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
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
			formData.append("id", content.id);

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
					.update({
						storage_file_name: path,
					})
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
			if (content.storage_file_name) {
				const formData = new FormData();
				formData.append("path", content.storage_file_name);

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
						<h2>PDF File</h2>
						{/* Loader - shown when status is PROCESSING or FAILED */}
						{showLoader && (
							<div className={styles.loaderContainer}>
								<div className={styles.loaderSpinner}></div>
								<p className={styles.loaderText}>
									Please wait until the pdf upload is done
								</p>
								<p className={styles.loaderStatus}>
									Current status: {uploadWorkerStatus}
								</p>
							</div>
						)}

						{/* PDF File Section - hidden when showLoader is true */}
						{!showLoader && (
							<>
								{pdfError && (
									<div
										className={styles.error}
										style={{ marginBottom: "16px" }}
									>
										{pdfError}
									</div>
								)}
								{/* Show file input only if no file is uploaded yet */}
								{!pdfPath && (
									<div className={styles.field}>
										<label htmlFor="pdf_file">
											Upload PDF File
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
								)}
								<div className={styles.pdfActions}>
									{pdfPath ? (
										<>
											<button
												type="button"
												onClick={handleGetPdfUrl}
												disabled={pdfLoading}
												className={styles.viewBtn}
											>
												{pdfLoading
													? "Loading..."
													: "View PDF"}
											</button>

											{/* Retry Upload button for IDLE or FAILED status */}
											{uploadWorkerStatus ===
												"FAILED" && (
												<button
													type="button"
													onClick={() => {}}
													disabled={pdfLoading}
													className={styles.uploadBtn}
												>
													Retry Upload
												</button>
											)}
										</>
									) : (
										<button
											type="button"
											onClick={handleUploadPdf}
											disabled={pdfLoading || !pdfFile}
											className={styles.uploadBtn}
										>
											{pdfLoading
												? "Uploading..."
												: "Upload PDF"}
										</button>
									)}
								</div>
								{pdfPath && (
									<div className={styles.pdfPath}>
										<small>Current file: {pdfPath}</small>
									</div>
								)}
							</>
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
						{/* Delete button - only shown when status is IDLE or SUCCESS */}
						{showActionButton && (
							<button
								type="button"
								onClick={handleDelete}
								className={styles.deleteBtn}
								disabled={loading || isPublished}
							>
								Delete
							</button>
						)}

						{showActionButton && (
							<div className={styles.rightActions}>
								<button
									type="submit"
									disabled={loading || isPublished}
									className={styles.submitBtn}
								>
									{loading ? "Saving..." : "Save Changes"}
								</button>
							</div>
						)}
					</div>
				</form>
			</main>
		</div>
	);
}
