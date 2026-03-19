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

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 🔒 HARD VALIDATION (no weak logic)
	const validateForm = () => {
		if (
			!formData.ebook_template_id ||
			formData.ebook_template_id.trim() === ""
		) {
			return "Template is required";
		}

		if (!formData.ebook_user_content_title.trim()) {
			return "Title is required";
		}

		if (!formData.ebook_user_content_description.trim()) {
			return "Description is required";
		}

		if (!ebookUser || !ebookUser.id) {
			return "Invalid user";
		}

		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (loading) return;

		setError(null);

		// 🚨 STEP 1: VALIDATE FIRST
		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		try {
			const templateId = formData.ebook_template_id.trim();

			const { data: templateData, error: templateError } = await supabase
				.from("ebook_template")
				.select("raw_githubusercontent_url")
				.eq("id", templateId)
				.single();

			if (templateError || !templateData) {
				throw new Error("Template not found");
			}

			const { data, error: insertError } = await supabase
				.from("ebook_user_content")
				.insert([
					{
						ebook_user_id: ebookUser.id,
						ebook_template_id: templateId,
						ebook_user_content_number:
							formData.ebook_user_content_number,
						ebook_user_content_title:
							formData.ebook_user_content_title.trim(),
						ebook_user_content_description:
							formData.ebook_user_content_description.trim(),
						is_published: false,
					},
				])
				.select()
				.single();

			if (insertError) {
				throw insertError;
			}

			// 🚀 STEP 5: NAVIGATE
			router.push(`/dashboard/ebook/${data.id}/edit`);
		} catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<h1>Create New Ebook</h1>
					<p>Fill in the details to create your new ebook</p>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<div className={styles.section}>
						<h2>Basic Information</h2>

						{/* TEMPLATE */}
						<div className={styles.field}>
							<label htmlFor="ebook_template_id">
								Template *
							</label>
							<select
								id="ebook_template_id"
								name="ebook_template_id"
								value={formData.ebook_template_id}
								onChange={handleChange}
							>
								<option value="">-- Select Template --</option>
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

						{/* TITLE */}
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_title">
								Title *
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

						{/* DESCRIPTION */}
						<div className={styles.field}>
							<label htmlFor="ebook_user_content_description">
								Description *
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
