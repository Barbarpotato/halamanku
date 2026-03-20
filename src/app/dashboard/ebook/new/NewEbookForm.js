"use client";

import { useState } from "react";
import Link from "next/link";
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
		<div className="page-container">
			<header className="header">
				<div className={styles.headerContent}>
					<div className="logo">
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
					<div className="nav-links">
						<Link href="/dashboard" className="nav-link">
							Dashboard
						</Link>
					</div>
					<div className="user-info">
						<div className="user-details">
							<span className="user-name">
								{ebookUser?.name || user.email}
							</span>
							<span className="user-email">{user.email}</span>
						</div>
						<form action="/auth/signout" method="post">
							<button className="btn-logout" type="submit">
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className="page-header">
					<div>
						<h1 className="page-header-title">Create New Ebook</h1>
						<p className="page-header-description">
							Fill in the details to create your new ebook
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="form-card">
					{error && <div className="error-message">{error}</div>}

					<div className="mb-xl">
						<h2 className="section-title">Basic Information</h2>

						{/* TEMPLATE */}
						<div className="field">
							<label
								htmlFor="ebook_template_id"
								className="field-label"
							>
								Template *
							</label>
							<select
								id="ebook_template_id"
								name="ebook_template_id"
								value={formData.ebook_template_id}
								onChange={handleChange}
								className="field-input"
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
						<div className="field">
							<label
								htmlFor="ebook_user_content_title"
								className="field-label"
							>
								Title *
							</label>
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Enter ebook title"
								className="field-input"
							/>
						</div>

						{/* DESCRIPTION */}
						<div className="field">
							<label
								htmlFor="ebook_user_content_description"
								className="field-label"
							>
								Description *
							</label>
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								placeholder="Enter ebook description"
								className="field-input"
							/>
						</div>
					</div>

					<div className="actions-row">
						<a href="/dashboard" className="btn-secondary">
							Cancel
						</a>

						<button
							type="submit"
							disabled={loading}
							className="btn-primary"
						>
							{loading ? "Creating..." : "Create Ebook"}
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
