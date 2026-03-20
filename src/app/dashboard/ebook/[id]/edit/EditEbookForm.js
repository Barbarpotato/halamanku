"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styles from "../../new/new.module.css";
import { useModal } from "@/components/ModalProvider";

// Services
import { updateEbookUserContent } from "@/services/userContent/update";
import { deleteEbookUserContent } from "@/services/userContent/delete";
import { uploadPdf, getPdfUrl } from "@/services/userContent/pdf";
import {
	publishEbookUserContent,
	createPreview,
} from "@/services/userContent/workflow";
import { getWorkerStatuses } from "@/services/userContent/utils";

// Components
import PageHeader from "@/components/PageHeader";
import TabActions from "./components/TabActions";
import BasicInfoTab from "./components/BasicInfoTab";
import PdfTab from "./components/PdfTab";
import PreviewTab from "./components/PreviewTab";

export default function EditEbookForm({ user, ebookUser, content, templates }) {
	const router = useRouter();
	const modal = useModal();
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
			return await getWorkerStatuses(content.id);
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

	// Upload new PDF
	const handleUploadPdf = async () => {
		if (!pdfFile) {
			setPdfError("Please select a file first");
			return;
		}

		setPdfLoading(true);
		setPdfError(null);

		try {
			const path = await uploadPdf(content.id, pdfFile);
			setPdfPath(path);
			setPdfFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
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
			const signedUrl = await getPdfUrl(pdfPath);
			window.open(signedUrl, "_blank");
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
			await updateEbookUserContent(content.id, formData);
			router.refresh();
			modal.show({
				type: "info",
				message: "Ebook updated successfully!",
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

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

		setPublishing(true);
		setError(null);

		try {
			await publishEbookUserContent(formData, content);
			modal.show({
				type: "info",
				message:
					"Ebook is being published. Please Wait for a while to see your page",
			});
		} catch (err) {
			setError(err.message);
			setPublishing(false);
		}
	};

	const handleCreatePreview = async () => {
		setCreatingPreview(true);
		setError(null);

		try {
			await createPreview(formData, content, user);
			router.refresh();
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="page-container">
			<PageHeader
				breadcrumb={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Edit" },
				]}
			/>

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
