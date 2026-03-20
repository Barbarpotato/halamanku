"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import styles from "../../new/new.module.css";

// Components
import TabActions from "./components/TabActions";
import BasicInfoTab from "./components/BasicInfoTab";
import PdfTab from "./components/PdfTab";
import PreviewTab from "./components/PreviewTab";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

const WORKFLOW_SERVICE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-workflow-service";

export default function EditEbookForm({ user, ebookUser, content, templates }) {
	const router = useRouter();
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const fileInputRef = useRef(null);

	// Tab state
	const [activeTab, setActiveTab] = useState("basic");

	// PDF file state
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfPath, setPdfPath] = useState(content.storage_file_name || "");
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState(null);

	// Preview creation state
	const [creatingPreview, setCreatingPreview] = useState(false);

	const [formData, setFormData] = useState({
		ebook_template_id: content.ebook_template_id || "",
		ebook_user_content_number: content.ebook_user_content_number || "",
		ebook_user_content_title: content.ebook_user_content_title || "",
		ebook_user_content_description:
			content.ebook_user_content_description || "",
		template_preview_code: content.ebook_template_preview_code || "",
		is_published: content.is_published || false,
	});

	// Upload worker status - will be updated via polling
	const [uploadWorkerStatus, setUploadWorkerStatus] = useState(
		content.upload_worker_status || "IDLE",
	);

	// Preview worker status - will be updated via polling
	const [previewWorkerStatus, setPreviewWorkerStatus] = useState(
		content.preview_worker_status || "IDLE",
	);

	const [publishWorkerStatus, setPublishWorkerStatus] = useState(
		content.publish_worker_status || "IDLE",
	);

	const [publishing, setPublishing] = useState(false);

	// ✅ SINGLE SOURCE OF TRUTH
	const { data: workerData } = useQuery({
		queryKey: ["ebookWorkerStatus", content.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("ebook_user_content")
				.select(
					`
					upload_worker_status,
					preview_worker_status,
					publish_worker_status
					`,
				)
				.eq("id", content.id)
				.single();

			if (error) return null;

			return {
				upload: data.upload_worker_status || "IDLE",
				preview: data.preview_worker_status || "IDLE",
				publish: data.publish_worker_status || "IDLE",
			};
		},

		refetchInterval: (data) => {
			if (!data) return 2000;

			const uploadDone =
				data.upload === "SUCCESS" || data.upload === "FAILED";
			const previewDone =
				data.preview === "SUCCESS" || data.preview === "FAILED";
			const publishDone =
				data.publish === "SUCCESS" || data.publish === "FAILED";

			// stop polling if both done
			if (uploadDone && previewDone && publishDone) return false;

			return 2000;
		},
	});

	useEffect(() => {
		if (!workerData) return;

		setUploadWorkerStatus(workerData.upload);
		setPreviewWorkerStatus(workerData.preview);
		setPublishWorkerStatus(workerData.publish);

		// stop preview loading
		if (workerData.preview !== "IDLE") {
			setCreatingPreview(false);
		}

		// stop publish loading
		if (workerData.publish !== "IDLE") {
			setPublishing(false);
		}

		if (
			workerData.upload === "SUCCESS" ||
			workerData.preview === "SUCCESS" ||
			workerData.publish === "SUCCESS"
		) {
			router.refresh();
		}
	}, [workerData]);

	// Determine if we should show loader (not IDLE or SUCCESS)
	const showLoader =
		uploadWorkerStatus !== "IDLE" && uploadWorkerStatus !== "SUCCESS";

	// Determine if we should show preview loader
	const showPreviewLoader =
		creatingPreview ||
		(previewWorkerStatus !== "IDLE" &&
			previewWorkerStatus !== "SUCCESS" &&
			previewWorkerStatus !== "FAILED");

	const showPublishLoader =
		publishing ||
		(publishWorkerStatus !== "IDLE" &&
			publishWorkerStatus !== "SUCCESS" &&
			publishWorkerStatus !== "FAILED");

	// Determine if delete button should be visible
	// Delete button: only visible if upload_worker_status == IDLE, FAILED OR SUCCESS
	const showDeleteButton =
		uploadWorkerStatus === "IDLE" ||
		uploadWorkerStatus === "FAILED" ||
		uploadWorkerStatus === "SUCCESS";

	// Publish button: only visible if PDF exists (storage_file_name is not null)
	const showPublishButton =
		!!content.storage_file_name && content.is_published === false;

	// Preview tab: only visible if storage_file_name != null AND upload_worker_status == SUCCESS
	const showPreviewTab =
		content.storage_file_name != null && uploadWorkerStatus === "SUCCESS";

	const isPublished = content.is_published === true;

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
					console.error(
						"Failed to delete file from storage:",
						result.error,
					);
				}
			}

			const { error: deleteEbookContentAccess } = await supabase
				.from("ebook_user_content_access")
				.delete()
				.eq(
					"ebook_user_content_number",
					content.ebook_user_content_number,
				);

			if (deleteEbookContentAccess) {
				throw deleteEbookContentAccess;
			}

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

	const handlePublish = async () => {
		if (!confirm("Are you sure you want to publish this ebook?")) return;

		setPublishing(true);
		setError(null);

		try {
			const { data: templateData, error: templateError } = await supabase
				.from("ebook_template")
				.select("template_name")
				.eq("id", content.ebook_template_id)
				.single();

			if (templateError || !templateData) {
				throw new Error(templateError?.message || "Template not found");
			}

			await fetch(WORKFLOW_SERVICE_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getAnonKey()}`,
				},
				body: JSON.stringify({
					new_repo: formData.ebook_user_content_number,
					event_type: "publish-ebook-site",
					content_number: formData.ebook_user_content_number,
					total_pages: content.storage_file_total_page,
					template_name: templateData.template_name,
				}),
			});

			alert(
				"Ebook is being published. Please Wait for a while to see your page",
			);
		} catch (err) {
			setError(err.message);
			setPublishing(false);
		}
	};

	const handleCreatePreview = async () => {
		setCreatingPreview(true);
		setError(null);

		try {
			const { data: templateData, error: templateError } = await supabase
				.from("ebook_template")
				.select("template_name")
				.eq("id", content.ebook_template_id)
				.single();

			if (templateError || !templateData) {
				throw new Error(templateError?.message || "Template not found");
			}

			const response = await fetch(WORKFLOW_SERVICE_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getAnonKey()}`,
				},
				body: JSON.stringify({
					event_type: "preview-ebook-site",
					content_number: formData.ebook_user_content_number,
					total_pages: content.storage_file_total_page,
					template_name: templateData.template_name,
				}),
			});

			const result = await response.json();

			if (result.status === "SUCCESS") {
				const { error: accessError } = await supabase
					.from("ebook_user_content_access")
					.insert({
						ebook_user_content_id: content.id,
						ebook_user_content_number:
							formData.ebook_user_content_number,
						auth_user_id: user.id,
						email_address: user.email,
						lynk_id_reference_id: null,
						storage_shard_name: content.storage_file_name.replace(
							".pdf",
							"",
						),
					});

				if (accessError) {
					console.error(
						"Failed to create access record:",
						accessError,
					);
				}

				router.refresh();
			} else {
				throw new Error(result.error || "Failed to create preview");
			}
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="page-container">
			<header className="header">
				<div className={styles.headerContent}>
					<div className="logo">
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
					<div className="breadcrumb">
						<Link href="/dashboard">Dashboard</Link>
						<span>/</span>
						<span>Edit</span>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className="page-header">
					<div>
						<h1 className="page-header-title">Edit Ebook</h1>
						<p className="page-header-description">
							Update your ebook details
						</p>
					</div>

					{/* Header Actions: Delete, Publish, Create Preview */}
					<TabActions
						showPublishButton={showPublishButton}
						showDeleteButton={showDeleteButton}
						formData={formData}
						loading={loading}
						isPublished={isPublished}
						creatingPreview={creatingPreview}
						onPublish={handlePublish}
						publishing={publishing}
						publishWorkerStatus={publishWorkerStatus}
						showPublishLoader={showPublishLoader}
						onCreatePreview={handleCreatePreview}
						onDelete={handleDelete}
						workerData={workerData}
						content={{
							...content,
							ebook_user: ebookUser,
						}}
						user={user}
					/>
				</div>

				<form onSubmit={handleSubmit} className="form-card">
					{error && <div className="error-message">{error}</div>}

					<input
						type="hidden"
						name="template_preview_code"
						value={formData.template_preview_code}
					/>

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

					{/* Tab Contents */}
					<div
						className={`tab-content ${activeTab === "basic" ? "active" : ""}`}
					>
						<BasicInfoTab
							formData={formData}
							handleChange={handleChange}
							templates={templates}
						/>
						<div className="actions-row">
							<button
								type="submit"
								disabled={loading}
								className="btn-primary"
							>
								{loading ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>

					<div
						className={`tab-content ${activeTab === "pdf" ? "active" : ""}`}
					>
						<PdfTab
							pdfFile={pdfFile}
							pdfPath={pdfPath}
							pdfLoading={pdfLoading}
							pdfError={pdfError}
							fileInputRef={fileInputRef}
							handleFileChange={handleFileChange}
							handleUploadPdf={handleUploadPdf}
							handleGetPdfUrl={handleGetPdfUrl}
							content={content}
							showLoader={showLoader}
							uploadWorkerStatus={uploadWorkerStatus}
						/>
					</div>

					{showPreviewTab && (
						<div
							className={`tab-content ${activeTab === "preview" ? "active" : ""}`}
						>
							<PreviewTab
								contentId={content.id}
								isActive={activeTab === "preview"}
								previewCode={
									content.ebook_template_preview_code
								}
								creatingPreview={creatingPreview}
								onCreatePreview={handleCreatePreview}
								previewWorkerStatus={previewWorkerStatus}
								showPreviewLoader={showPreviewLoader}
							/>
						</div>
					)}
				</form>
			</main>
		</div>
	);
}
