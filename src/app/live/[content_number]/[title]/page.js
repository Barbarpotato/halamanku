"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./live.module.css";

export default function TestPage() {
	const params = useParams();
	const router = useRouter();
	const iframeRef = useRef(null);
	const [content, setContent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const contentNumber = decodeURIComponent(params.content_number);
	const title = decodeURIComponent(params.title).replace(/-/g, " ");

	useEffect(() => {
		const fetchContent = async () => {
			const supabase = createClient();

			// Auth check
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push(
					`/login?next=${encodeURIComponent(`/test/${params.content_number}/${params.title}`)}`,
				);
				return;
			}

			// Get session
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session?.access_token) {
				router.push(
					`/login?next=${encodeURIComponent(`/test/${params.content_number}/${params.title}`)}`,
				);
				return;
			}

			// Store access token for iframe
			sessionStorage.setItem("access_token", session.access_token);

			// Fetch content
			const { data: contentData, error: contentError } = await supabase
				.from("ebook_user_content")
				.select(
					"id, ebook_user_content_number, ebook_user_content_title, is_published, ebook_template_publish_code",
				)
				.eq("ebook_user_content_number", contentNumber)
				.eq("ebook_user_content_title", title)
				.single();

			if (contentError || !contentData) {
				setError("Content Not Found");
				setLoading(false);
				return;
			}

			if (contentData.is_published !== true) {
				setError("Content Not Available");
				setLoading(false);
				return;
			}

			setContent(contentData);
			setLoading(false);
		};

		fetchContent();
	}, [contentNumber, title, params.content_number, params.title, router]);

	// Write HTML to iframe with injected PDF URL + session
	useEffect(() => {
		if (iframeRef.current && content?.ebook_template_publish_code) {
			let htmlContent = content.ebook_template_publish_code;
			const iframe = iframeRef.current;
			const doc = iframe.contentDocument || iframe.contentWindow.document;
			doc.open();
			doc.write(htmlContent);
			doc.close();
		}
	}, [content?.ebook_template_publish_code]);

	if (loading) {
		return (
			<div
				className={styles.container}
				style={{
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>{error}</h1>
					<p>
						The requested content could not be found or is not
						accessible.
					</p>
				</div>
			</div>
		);
	}

	return content?.ebook_template_publish_code ? (
		<iframe
			ref={iframeRef}
			className={styles.iframe}
			title="Ebook Test"
			sandbox="allow-scripts allow-same-origin allow-forms"
			style={{ width: "100%", height: "100vh", border: "none" }}
		/>
	) : (
		<div
			className={styles.container}
			style={{
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<p>No content available.</p>
		</div>
	);
}
