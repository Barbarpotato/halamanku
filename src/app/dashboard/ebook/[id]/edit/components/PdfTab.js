"use client";

import styles from "../../../new/new.module.css";

export default function PdfTab({
	isActive,
	pdfFile,
	pdfPath,
	pdfLoading,
	pdfError,
	uploadWorkerStatus,
	showLoader,
	isPublished,
	handleFileChange,
	handleUploadPdf,
	handleGetPdfUrl,
	fileInputRef,
}) {
	return (
		<div
			className={`${styles.tabContent} ${isActive ? styles.active : ""}`}
		>
			<div className={styles.section}>
				<h2>PDF File</h2>

				{/* Loader - shown when status is PROCESSING */}
				{showLoader && (
					<div className={styles.loaderContainer}>
						<div className={styles.loaderSpinner}></div>
						<p className={styles.loaderText}>
							Please wait until the pdf upload is done
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
										{pdfLoading ? "Loading..." : "View PDF"}
									</button>

									{uploadWorkerStatus === "FAILED" && (
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
									{pdfLoading ? "Uploading..." : "Upload PDF"}
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
		</div>
	);
}
