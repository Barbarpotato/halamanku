"use client";

import { useRef, useEffect } from "react";
import styles from "./preview.module.css";
import { createClient } from "@/lib/supabase/client"; // your client-side Supabase helper

export default function PreviewContent({ content, template }) {
	const iframeRef = useRef(null);

	// Fetch Supabase session in the client
	useEffect(() => {
		const fetchSession = async () => {
			const supabase = createClient(); // client-side Supabase
			const { data } = await supabase.auth.getSession();
			if (data.session) {
				sessionStorage.setItem(
					"access_token",
					data.session.access_token,
				);
			}
		};

		fetchSession();
	}, []);

	// Write HTML to iframe with injected PDF URL + session
	useEffect(() => {
		if (iframeRef.current && content.ebook_template_preview_code) {
			let htmlContent = content.ebook_template_preview_code;
			const iframe = iframeRef.current;
			const doc = iframe.contentDocument || iframe.contentWindow.document;
			doc.open();
			doc.write(htmlContent);
			doc.close();
		}
	}, [content.ebook_template_preview_code]);

	return content.ebook_template_preview_code ? (
		<iframe
			ref={iframeRef}
			className={styles.previewIframe}
			title="Ebook Preview"
			sandbox="allow-scripts allow-same-origin allow-forms"
		/>
	) : (
		<div
			style={{
				padding: "20px",
				textAlign: "center",
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div>
				<h2>Preview Not Available</h2>
				<p>
					The preview for this ebook has not been generated yet.
					Please go back to the edit page and create the preview.
				</p>
				<a
					href={`/dashboard/ebook/${content.id}/edit`}
					style={{ color: "blue", textDecoration: "underline" }}
				>
					Go to Edit Page
				</a>
			</div>
		</div>
	);
}
