"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./preview.module.css";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

export default function PreviewContent({ content, template }) {
	const iframeRef = useRef(null);
	const [pdfUrl, setPdfUrl] = useState(null);

	// Get the anon key from environment
	const getAnonKey = () => {
		if (typeof window !== "undefined") {
			return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		}
		return null;
	};

	useEffect(() => {
		const fetchPdfUrl = async () => {
			if (content.supabase_file_storage_url) {
				try {
					const url = `${STORAGE_URL}?path=${encodeURIComponent(content.supabase_file_storage_url)}`;
					const response = await fetch(url, {
						method: "GET",
						headers: {
							Authorization: `Bearer ${getAnonKey()}`,
						},
					});

					const result = await response.json();

					if (result.status === "SUCCESS") {
						setPdfUrl(result.data.signedUrl);
					}
				} catch (err) {
					console.error("Failed to fetch PDF URL:", err);
				}
			}
		};

		fetchPdfUrl();
	}, [content.supabase_file_storage_url]);

	useEffect(() => {
		if (iframeRef.current && content.ebook_template_preview_code) {
			let htmlContent = content.ebook_template_preview_code;

			// Replace pdf_file:"" with the actual PDF URL
			if (pdfUrl) {
				htmlContent = htmlContent.replace(
					/PDF_URL:\s*["'][^"']*["']/g,
					`PDF_URL: "${pdfUrl}"`,
				);
			}

			// Write the HTML content to the iframe
			const iframe = iframeRef.current;
			const doc = iframe.contentDocument || iframe.contentWindow.document;
			doc.open();
			doc.write(htmlContent);
			doc.close();
		}
	}, [content.ebook_template_preview_code, pdfUrl]);

	return (
		<iframe
			ref={iframeRef}
			className={styles.previewIframe}
			title="Ebook Preview"
			sandbox="allow-scripts allow-same-origin allow-forms"
		/>
	);
}
