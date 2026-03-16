"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./new.module.css";

export default function NewEbookForm({ user, ebookUser, templates }) {
	const router = useRouter();
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		ebook_template_id: "",
		ebook_user_content_number: `CNT${Date.now()}`,
		ebook_user_content_title: "",
		ebook_user_content_description: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// If template is selected, fetch template data first
			let templatePreviewCode = null;
			if (formData.ebook_template_id) {
				const { data: templateData, error: templateError } =
					await supabase
						.from("ebook_template")
						.select("raw_githubusercontent_url")
						.eq("id", formData.ebook_template_id)
						.single();

				if (templateError) {
					throw new Error("Template not found");
				}

				if (templateData?.raw_githubusercontent_url) {
					// Fetch the actual content from the GitHub URL
					try {
						const response = await fetch(
							templateData.raw_githubusercontent_url,
						);
						if (!response.ok) {
							throw new Error("Failed to fetch template content");
						}
						const content = await response.text();
						templatePreviewCode = content;
					} catch (fetchError) {
						throw new Error(
							"Failed to fetch template content: " +
								fetchError.message,
						);
					}
				}
			}

			const { data, error: insertError } = await supabase
				.from("ebook_user_content")
				.insert([
					{
						ebook_user_id: ebookUser.id,
						ebook_template_id: formData.ebook_template_id || null,
						ebook_user_content_number:
							formData.ebook_user_content_number,
						ebook_user_content_title:
							formData.ebook_user_content_title,
						ebook_user_content_description:
							formData.ebook_user_content_description,
						ebook_template_preview_code: templatePreviewCode,
						is_published: false,
					},
				])
				.select()
				.single();

			if (insertError) {
				throw insertError;
			}

			router.push(`/dashboard/ebook/${data.id}/edit`);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
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
						<span>New Ebook</span>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<h1>Create New Ebook</h1>
					<p>Fill in the details to create your new ebook</p>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.section}>
						<h2>Basic Information</h2>
						<div className={styles.grid}>
							<div className={styles.field}>
								<label htmlFor="ebook_user_content_number">
									Content Number
								</label>
								<input
									type="text"
									id="ebook_user_content_number"
									name="ebook_user_content_number"
									value={formData.ebook_user_content_number}
									disabled
									required
								/>
							</div>
							<div className={styles.field}>
								<label htmlFor="ebook_template_id">
									Template
								</label>
								<select
									id="ebook_template_id"
									name="ebook_template_id"
									value={formData.ebook_template_id}
									onChange={handleChange}
								>
									<option value="">Select a template</option>
									{templates.map((template) => (
										<option
											key={template.id}
											value={template.id}
										>
											{template.template_name ||
												`${template.owner_name}/${template.repository_name} - ${template.file_path}`}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_title">
								Title
							</label>
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Enter ebook title"
							/>
						</div>
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_description">
								Description
							</label>
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								placeholder="Enter ebook description"
							/>
						</div>
					</div>

					<div className={styles.actions}>
						<a href="/dashboard" className={styles.cancelBtn}>
							Cancel
						</a>
						<button
							type="submit"
							disabled={loading}
							className={styles.submitBtn}
						>
							{loading ? "Creating..." : "Create Ebook"}
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
