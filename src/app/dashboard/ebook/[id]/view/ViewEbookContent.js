"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./view.module.css";

const STORAGE_URL =
	"https://stzieqkgyktsrtauytmu.supabase.co/functions/v1/ebook-storage-service";

export default function ViewEbookContent({ user, ebookUser, content }) {
	const iframeRef = useRef(null);
	const [pdfUrl, setPdfUrl] = useState(null);

	// Get the anon key from environment
	const getAnonKey = () => {
		if (typeof window !== "undefined") {
			return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		}
		return null;
	};

	// Helper function to update CSS variables and config in the template HTML
	const updateTemplate = (
		htmlCode,
		primaryBg,
		secondaryBg,
		textColor,
		headingText,
	) => {
		if (!htmlCode) return htmlCode;

		let updatedHtml = htmlCode;

		// Update primary-background-color
		updatedHtml = updatedHtml.replace(
			/--primary-background-color:\s*[^;]+;/g,
			`--primary-background-color: ${primaryBg};`,
		);

		// Update secondary-background-color (handle typo: seconary -> secondary)
		updatedHtml = updatedHtml.replace(
			/--seconary-background-color:\s*[^;]+;/g,
			`--secondary-background-color: ${secondaryBg};`,
		);
		updatedHtml = updatedHtml.replace(
			/--secondary-background-color:\s*[^;]+;/g,
			`--secondary-background-color: ${secondaryBg};`,
		);

		// Update text-color
		updatedHtml = updatedHtml.replace(
			/--text-color:\s*[^;]+;/g,
			`--text-color: ${textColor};`,
		);

		// Update heading in APP_CONFIG
		if (headingText) {
			updatedHtml = updatedHtml.replace(
				/heading:\s*["'][^"']*["']/g,
				`heading: "${headingText}"`,
			);
		}

		return updatedHtml;
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

			// Update CSS variables and heading
			htmlContent = updateTemplate(
				htmlContent,
				content.template_primary_background_color || "#1e2030",
				content.template_secondary_background_color || "#805ad5",
				content.template_text_color || "#e0e0ff",
				content.template_heading_text || "",
			);

			// Replace pdf_file with the actual PDF URL
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
	}, [content, pdfUrl]);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.logo}>
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>Ebook Admin</span>
					</div>
					<div className={styles.breadcrumb}>
						<a href="/dashboard">Dashboard</a>
						<span>/</span>
						<span>View</span>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<div className={styles.titleRow}>
						<div>
							<h1>
								{content.ebook_user_content_title ||
									"Untitled Ebook"}
							</h1>
							<p className={styles.contentNumber}>
								{content.ebook_user_content_number}
							</p>
						</div>
						<div className={styles.status}>
							{content.is_published ? (
								<span className={styles.published}>
									Published
								</span>
							) : (
								<span className={styles.draft}>Draft</span>
							)}
						</div>
					</div>
				</div>

				<div className={styles.grid}>
					<div className={styles.mainContent}>
						<div className={styles.card}>
							<h2>Description</h2>
							<p>
								{content.ebook_user_content_description ||
									"No description provided."}
							</p>
							{content.is_published && (
								<div className={styles.publishUrlSection}>
									<h3>Published Site URL</h3>
									{content.publish_site_url ? (
										<a
											href={content.publish_site_url}
											target="_blank"
											rel="noopener noreferrer"
											className={styles.publishUrl}
										>
											{content.publish_site_url}
										</a>
									) : (
										<p className={styles.pendingUrl}>
											The ebook site URL is ongoing to be created.
										</p>
									)}
								</div>
							)}
						</div>

						{content.ebook_template_preview_code && (
							<div className={styles.card}>
								<h2>Preview</h2>
								<iframe
									ref={iframeRef}
									className={styles.previewIframe}
									title="Ebook Preview"
									sandbox="allow-scripts allow-same-origin allow-forms"
								/>
							</div>
						)}
					</div>

					<div className={styles.sidebar}>
						<div className={styles.card}>
							<h2>Details</h2>
							<div className={styles.details}>
								<div className={styles.detailItem}>
									<span className={styles.label}>
										Created
									</span>
									<span className={styles.value}>
										{formatDate(content.created)}
									</span>
								</div>
								<div className={styles.detailItem}>
									<span className={styles.label}>
										Published
									</span>
									<span className={styles.value}>
										{formatDate(content.published_date)}
									</span>
								</div>
								<div className={styles.detailItem}>
									<span className={styles.label}>
										Template
									</span>
									<span className={styles.value}>
										{content.ebook_template
											? `${content.ebook_template?.template_name || `${content.ebook_template?.owner_name}/${content.ebook_template?.repository_name}`}`
											: "No template selected"}
									</span>
								</div>
							</div>
						</div>

						<div className={styles.card}>
							<h2>Styling</h2>
							<div className={styles.colorGrid}>
								<div className={styles.colorItem}>
									<div
										className={styles.colorSwatch}
										style={{
											backgroundColor:
												content.template_primary_background_color,
										}}
									/>
									<span>Primary BG</span>
									<code>
										{
											content.template_primary_background_color
										}
									</code>
								</div>
								<div className={styles.colorItem}>
									<div
										className={styles.colorSwatch}
										style={{
											backgroundColor:
												content.template_secondary_background_color,
										}}
									/>
									<span>Secondary BG</span>
									<code>
										{
											content.template_secondary_background_color
										}
									</code>
								</div>
								<div className={styles.colorItem}>
									<div
										className={styles.colorSwatch}
										style={{
											backgroundColor:
												content.template_text_color,
										}}
									/>
									<span>Text</span>
									<code>{content.template_text_color}</code>
								</div>
							</div>
						</div>

						<div className={styles.actions}>
							{!content.is_published && (
								<a
									href={`/dashboard/ebook/${content.id}/edit`}
									className={styles.editBtn}
								>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								Edit Ebook
								</a>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
