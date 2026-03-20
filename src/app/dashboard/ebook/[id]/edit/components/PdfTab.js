"use client";

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
}) {
	const isPublished = content?.is_published === true;

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
								{pdfLoading ? "Uploading..." : "Upload PDF"}
							</button>
						)}
					</div>

					{pdfPath && (
						<div className="pdf-path mt-md">
							<small className="text-secondary">
								Current file: {pdfPath}
							</small>
						</div>
					)}
				</>
			)}
		</div>
	);
}
