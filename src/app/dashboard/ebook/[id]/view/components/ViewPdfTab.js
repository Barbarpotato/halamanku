"use client";

import { useState } from "react";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

export default function ViewPdfTab({ content }) {
	const [pdfLoading, setPdfLoading] = useState(false);
	const pdfPath = content.storage_file_name;

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
		<div className="mb-xl">
			<h2 className="section-title">PDF File</h2>

			{pdfPath ? (
				<>
					<div className="pdf-actions">
						<button
							type="button"
							onClick={handleGetPdfUrl}
							disabled={pdfLoading}
							className="btn-success"
						>
							{pdfLoading ? "Loading..." : "View PDF"}
						</button>
					</div>
					<div className="pdf-path mt-md">
						<small className="text-secondary">
							Current file: {pdfPath}
						</small>
					</div>
				</>
			) : (
				<div className="empty-state">
					<p>No PDF file uploaded yet.</p>
				</div>
			)}
		</div>
	);
}
