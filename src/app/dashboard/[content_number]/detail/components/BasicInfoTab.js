"use client";

import { useState, useRef, useEffect } from "react";
import { uploadPdf, getPdfUrl, deletePdf } from "@/services/userContent/pdf";
import { updateEbookUserContent } from "@/services/userContent/update";

export default function BasicInfoTab({
	content,
	formData,
	setFormData,
	templates,
	readOnly = false,
	setError,
	modal,
	onSave,
	loading,
}) {
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// PDF functionality from PdfTab
	const isPublished = content?.is_published === true;

	const fileInputRef = useRef(null);

	// PDF file state
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfPath, setPdfPath] = useState(content.storage_file_name || "");
	const [readOnlyPdfLoading, setReadOnlyPdfLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState(null);

	const [pdfLoading, setPdfLoading] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(!!pdfPath);

	useEffect(() => {
		const loadPreviewUrl = async () => {
			if (pdfPath) {
				setPreviewLoading(true);
				try {
					const signedUrl = await getPdfUrl(pdfPath);
					setPreviewUrl(signedUrl);
				} catch (err) {
					console.error("Failed to get preview URL:", err);
				} finally {
					setPreviewLoading(false);
				}
			} else {
				setPreviewUrl(null);
				setPreviewLoading(false);
			}
		};
		loadPreviewUrl();
	}, [pdfPath]);

	const STORAGE_URL =
		"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

	const getAnonKey = () => {
		if (typeof window !== "undefined") {
			return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		}
		return null;
	};

	// Handle file selection
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.type !== "application/pdf") {
				setError("Only PDF files are allowed");
				return;
			}
			setPdfFile(file);
			setError(null);
		}
	};

	// Upload new PDF
	const handleUploadPdf = async () => {
		if (!pdfFile) {
			setError("Please select a file first");
			return;
		}

		setPdfLoading(true);
		setError(null);

		try {
			const path = await uploadPdf(content.id, pdfFile);
			setPdfPath(path);
			setPdfFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	// Get signed URL
	const handleGetPdfUrl = async () => {
		if (!pdfPath) {
			setError("No file to view");
			return;
		}

		setPdfLoading(true);
		setError(null);

		try {
			const signedUrl = await getPdfUrl(pdfPath);
			window.open(signedUrl, "_blank");
		} catch (err) {
			setError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	const handleReadOnlyGetPdfUrl = async () => {
		if (!pdfPath) return;

		setReadOnlyPdfLoading(true);

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
			}
		} catch (err) {
			console.error("Failed to get PDF URL:", err);
		} finally {
			setReadOnlyPdfLoading(false);
		}
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// Delete PDF
	const handleDeletePdf = async () => {
		if (!pdfPath) {
			setError("No file to delete");
			return;
		}

		const confirmed = await modal.confirm({
			message: "Are you sure you want to delete the PDF file?",
		});
		if (!confirmed) {
			return;
		}

		setPdfLoading(true);
		setError(null);

		try {
			await deletePdf(pdfPath);
			await updateEbookUserContent(content.id, { storage_file_name: null });
			setPdfPath("");
			setPreviewUrl(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	return (
		<div className="mb-xl">
			<h2 className="section-title my-2">General Information</h2>
			<div className="flex flex-col lg:flex-row gap-8">
				{/* PDF Section */}
				<div className="flex-1">
					{pdfPath ? (
						<div className="field">
							<div className="mb-4">
								<div className="border border-gray-300 rounded-lg overflow-hidden bg-white" style={{ height: '400px' }}>
									{previewLoading ? (
										<div className="flex items-center justify-center h-full">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
										</div>
									) : previewUrl ? (
										<iframe
											src={previewUrl}
											width="100%"
											height="100%"
											style={{ border: 'none' }}
											title="PDF Preview"
										></iframe>
									) : (
										<div className="flex items-center justify-center h-full text-gray-500">
											Failed to load preview
										</div>
									)}
								</div>
							</div>
							{!readOnly && !isPublished && (
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleDeletePdf}
										disabled={pdfLoading}
										className="btn-danger"
									>
										{pdfLoading ? "Loading..." : "Delete PDF"}
									</button>
								</div>
							)}
						</div>
					) : readOnly ? (
						<div className="field">
							<div className="field-value">No PDF uploaded</div>
						</div>
					) : (
						<>
							{/* Show file input only if no file is uploaded yet */}
							{!pdfPath && !pdfFile && (
								<div className="field">
									<label className="field-label">Upload PDF File</label>
									<div
										onClick={triggerFileInput}
										className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
									>
										<svg
											className="mx-auto h-12 w-12 text-gray-400"
											stroke="currentColor"
											fill="none"
											viewBox="0 0 48 48"
											aria-hidden="true"
										>
											<path
												d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<div className="mt-4">
											<p className="text-sm text-gray-500">
												Click to upload a PDF file
											</p>
											<p className="text-xs text-gray-400">
												PDF files only
											</p>
										</div>
									</div>
									<input
										type="file"
										ref={fileInputRef}
										accept=".pdf"
										onChange={handleFileChange}
										disabled={isPublished}
										className="hidden"
									/>
								</div>
							)}

							{/* Show selected file details if file is selected but not uploaded */}
							{pdfFile && !pdfPath && (
								<div className="field">
									<label className="field-label">Selected PDF File</label>
									<div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												<svg
													className="h-8 w-8 text-red-500 mr-3"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
														clipRule="evenodd"
													/>
												</svg>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{pdfFile.name}
													</p>
													<p className="text-xs text-gray-500">
														{(pdfFile.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											</div>
											<button
												type="button"
												onClick={() => {
													setPdfFile(null);
													if (fileInputRef.current) {
														fileInputRef.current.value = "";
													}
												}}
												className="text-gray-400 hover:text-gray-600"
											>
												<svg
													className="h-5 w-5"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
														clipRule="evenodd"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							)}

							{pdfFile && !pdfPath && (
								<div className="mt-4">
									<button
										type="button"
										onClick={handleUploadPdf}
										disabled={pdfLoading || !pdfFile}
										className="btn-primary"
									>
										{pdfLoading ? "Uploading..." : "Upload PDF"}
									</button>
								</div>
							)}
						</>
					)}
				</div>

				{/* Basic Information Section */}
				<div className="flex-1 ">
					<div className="field">
						<label className="field-label">Title</label>
						{readOnly ? (
							<div className="field-value">
								{content.ebook_user_content_title || "Untitled"}
							</div>
						) : (
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Enter ebook title"
								className="field-input"
							/>
						)}
					</div>
					<div className="field">
						<label className="field-label">Description</label>
						{readOnly ? (
							<div className="field-value">
								{content.ebook_user_content_description ||
									"No description provided."}
							</div>
						) : (
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								style={{ resize: "none" }}
								placeholder="Enter ebook description"
								className="field-input"
							/>
						)}


						{!readOnly && (
							<button
								type="button"
								onClick={onSave}
								disabled={loading}
								className="btn-primary"
							>
								{loading ? "Loading..." : "Save Changes"}
							</button>
						)}
					</div>
				</div>
			</div>

		</div>
	);
}
