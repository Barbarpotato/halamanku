"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Services
import { validateEbookUserContentForm } from "@/services/userContent/validation";
import { createEbookUserContent } from "@/services/userContent/create";

// Components
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

export default function New({ user, ebookUser, templates }) {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		ebook_user_content_title: "",
		ebook_user_content_description: "",
		is_private: false,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const validateForm = () => {
		return validateEbookUserContentForm(formData, ebookUser);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (loading) return;

		setError(null);

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		try {
			const data = await createEbookUserContent(formData, ebookUser);
			router.push(`/dashboard/${data.ebook_user_content_number}/detail`);
		} catch (err) {
			setError(err.message || "Terjadi kesalahan");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page-container">
			<PageHeader user={user} ebookUser={ebookUser} showUserInfo={true} />

			<main className="main">
				<div className="page-header">
					<div>
						<Breadcrumb
							items={[
								{ label: "Dasbor", href: "/dashboard" },
								{
									label: "Buat",
								},
							]}
						/>
						<h1 className="page-header-title">Buat</h1>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="form-card">
					{error && <div className="error-message">{error}</div>}

					<div className="mb-xl">
						<h2 className="section-title">Informasi Dasar</h2>

						{/* TITLE */}
						<div className="field">
							<label
								htmlFor="ebook_user_content_title"
								className="field-label"
							>
								Judul *
							</label>
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Masukkan judul ebook"
								className="field-input"
							/>
						</div>

						{/* DESCRIPTION */}
						<div className="field">
							<label
								htmlFor="ebook_user_content_description"
								className="field-label"
							>
								Deskripsi *
							</label>
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								placeholder="Masukkan deskripsi ebook"
								className="field-input"
							/>
						</div>

						{/* IS PRIVATE */}
						<div className="field">
							<label className="field-label flex items-center">
								<input
									type="checkbox"
									id="is_private"
									name="is_private"
									checked={formData.is_private}
									onChange={handleChange}
									className="mr-2 h-4 w-4"
								/>
								Hanya pengguna yang memiliki akses yang dapat
								melihat konten ini
							</label>
						</div>
					</div>

					<div className="actions-row">
						<a href="/dashboard" className="btn-secondary">
							Batal
						</a>

						<button
							type="submit"
							disabled={loading}
							className="btn-primary"
						>
							{loading ? "Membuat..." : "Buat"}
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
