"use client";

import { useState } from "react";

export default function PdfTab({
	pdfFile,
	pdfPath,
	pdfLoading,
	pdfError,
	uploadWorkerStatus,
	showLoader,
	handleFileChange,
	handleUploadPdf,
	handleGetPdfUrl,
	fileInputRef,
	content,
	readOnly = false,
}) {
	const isPublished = content?.is_published === true;

	const [readOnlyPdfLoading, setReadOnlyPdfLoading] = useState(false);

	const STORAGE_URL =
		"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

	const getAnonKey = () => {
		if (typeof window !== "undefined") {
			return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		}
		return null;
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

			{/* Loader - shown when status is PROCESSING */}
			{showLoader && (
				<div className="loader-container">
					<div className="loader-spinner"></div>
					<p className="loader-text">
						Please wait until the pdf upload is done
					</p>
				</div>
			)}

			{/* PDF File Section - hidden when showLoader is true */}
			{!showLoader && (
				<>
					{pdfError && (
						<div className="error-message mb-lg">{pdfError}</div>
					)}

					{readOnly ? (
						<>
							{pdfPath ? (
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
									<label className="field-label">
										PDF File
									</label>
									<div className="field-value">
										No PDF uploaded
									</div>
								</div>
							)}
						</>
					) : (
						<>
							{/* Show file input only if no file is uploaded yet */}
							{!pdfPath && (
								<div className="field">
									<label
										htmlFor="pdf_file"
										className="field-label"
									>
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
											{pdfLoading
												? "Loading..."
												: "View PDF"}
										</button>

										{uploadWorkerStatus === "FAILED" && (
											<button
												type="button"
												onClick={() => {}}
												disabled={pdfLoading}
												className="btn-primary"
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
										className="btn-primary"
									>
										{pdfLoading
											? "Uploading..."
											: "Upload PDF"}
									</button>
								)}
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}
