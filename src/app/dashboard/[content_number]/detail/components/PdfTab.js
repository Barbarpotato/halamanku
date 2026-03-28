"use client";

import { useState, useRef } from "react";
import { uploadPdf, getPdfUrl } from "@/services/userContent/pdf";

export default function PdfTab({ setError, content, readOnly = false }) {
	const isPublished = content?.is_published === true;

	const fileInputRef = useRef(null);

	// PDF file state
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfPath, setPdfPath] = useState(content.storage_file_name || "");
	const [readOnlyPdfLoading, setReadOnlyPdfLoading] = useState(false);

	const [pdfLoading, setPdfLoading] = useState(false);

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

	return (
		<div className="mb-xl">
			<h2 className="section-title">PDF File</h2>

			{/* PDF File Section */}
			{readOnly ? (
				pdfPath ? (
					<div className="field">
						<div className="">
							<button
								onClick={handleReadOnlyGetPdfUrl}
								disabled={readOnlyPdfLoading}
								className="btn-secondary"
							>
								{readOnlyPdfLoading
									? "Loading..."
									: "Download PDF"}
							</button>
						</div>
					</div>
				) : (
					<div className="field">
						<label className="field-label">PDF File</label>
						<div className="field-value">No PDF uploaded</div>
					</div>
				)
			) : (
				<>
					{/* Show file input only if no file is uploaded yet */}
					{!pdfPath && (
						<div className="field">
							<label htmlFor="pdf_file" className="field-label">
								Upload PDF File
							</label>
							<input
								type="file"
								id="pdf_file"
								ref={fileInputRef}
								accept=".pdf"
								onChange={handleFileChange}
								disabled={isPublished}
								className="field-input"
							/>
						</div>
					)}

					<div className="pdf-actions">
						{pdfPath ? (
							<>
								<button
									type="button"
									onClick={handleGetPdfUrl}
									disabled={pdfLoading}
									className="btn-success"
								>
									{pdfLoading ? "Loading..." : "View PDF"}
								</button>
							</>
						) : (
							<button
								type="button"
								onClick={handleUploadPdf}
								disabled={pdfLoading || !pdfFile}
								className="btn-primary"
							>
								{pdfLoading ? "Uploading..." : "Upload PDF"}
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
