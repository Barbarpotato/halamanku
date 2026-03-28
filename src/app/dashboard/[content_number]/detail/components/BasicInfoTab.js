"use client";

export default function BasicInfoTab({
	content,
	formData,
	setFormData,
	templates,
	readOnly = false,
}) {
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	return (
		<div className="mb-xl">
			<h2 className="section-title">Basic Information</h2>
			<div className="field">
				<label className="field-label">Title</label>
				{readOnly ? (
					<div className="field-value">
						{content.ebook_user_content_title || "Untitled"}
					</div>
				) : (
					<input
						type="text"
						id="ebook_user_content_title"
						name="ebook_user_content_title"
						value={formData.ebook_user_content_title}
						onChange={handleChange}
						placeholder="Enter ebook title"
						className="field-input"
					/>
				)}
			</div>
			<div className="field">
				<label className="field-label">Description</label>
				{readOnly ? (
					<div className="field-value">
						{content.ebook_user_content_description ||
							"No description provided."}
					</div>
				) : (
					<textarea
						id="ebook_user_content_description"
						name="ebook_user_content_description"
						value={formData.ebook_user_content_description}
						onChange={handleChange}
						rows={4}
						placeholder="Enter ebook description"
						className="field-input"
					/>
				)}
			</div>
		</div>
	);
}
