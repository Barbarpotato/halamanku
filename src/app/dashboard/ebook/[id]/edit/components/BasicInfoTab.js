"use client";

export default function BasicInfoTab({ formData, handleChange, templates }) {
	return (
		<div className="mb-xl">
			<h2 className="section-title">Basic Information</h2>
			<div className="grid-auto-fit">
				<div className="field">
					<label htmlFor="ebook_template_id" className="field-label">
						Template
					</label>
					<select
						id="ebook_template_id"
						name="ebook_template_id"
						value={formData.ebook_template_id}
						onChange={handleChange}
						className="field-input"
					>
						<option value="">Select a template</option>
						{templates.map((template) => (
							<option key={template.id} value={template.id}>
								{template.template_name}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="field">
				<label
					htmlFor="ebook_user_content_title"
					className="field-label"
				>
					Title
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
			<div className="field">
				<label
					htmlFor="ebook_user_content_description"
					className="field-label"
				>
					Description
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
	);
}
