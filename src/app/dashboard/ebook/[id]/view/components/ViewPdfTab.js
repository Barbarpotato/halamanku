"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../../../new/new.module.css";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

export default function ViewPdfTab({ isActive, content }) {
	const [pdfLoading, setPdfLoading] = useState(false);
	const pdfPath = content.storage_file_name;
	const uploadWorkerStatus = content.upload_worker_status;

	// Get the anon key from environment
	const getAnonKey = () => {
		if (typeof window !== "undefined") {
			return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		}
		return null;
	};

	const handleGetPdfUrl = async () => {
		if (!pdfPath) return;

		setPdfLoading(true);

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
			setPdfLoading(false);
		}
	};

	return (
		<div
			className={`${styles.tabContent} ${isActive ? styles.active : ""}`}
		>
			<div className={styles.section}>
				<h2>PDF File</h2>

				{pdfPath ? (
					<>
						<div className={styles.pdfActions}>
							<button
								type="button"
								onClick={handleGetPdfUrl}
								disabled={pdfLoading}
								className={styles.viewBtn}
							>
								{pdfLoading ? "Loading..." : "View PDF"}
							</button>
						</div>
						<div className={styles.pdfPath}>
							<small>Current file: {pdfPath}</small>
						</div>
					</>
				) : (
					<div className={styles.emptyState}>
						<p>No PDF file uploaded yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}
