"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./new.module.css";

// Services
import { validateEbookUserContentForm } from "@/services/userContent/validation";
import { createEbookUserContent } from "@/services/userContent/create";

// Components
import PageHeader from "@/components/PageHeader";

export default function NewEbookForm({ user, ebookUser, templates }) {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		ebook_template_id: "",
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
		return validateEbookUserContentForm(formData, ebookUser);
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
			const data = await createEbookUserContent(formData, ebookUser);
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
			<PageHeader
				breadcrumb={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Create" },
				]}
			/>

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
