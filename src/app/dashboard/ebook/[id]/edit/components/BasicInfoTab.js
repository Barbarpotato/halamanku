"use client";

import styles from "../../../new/new.module.css";

export default function BasicInfoTab({
	isActive,
	formData,
	handleChange,
	isPublished,
	templates,
	loading,
}) {
	return (
		<div
			className={`${styles.tabContent} ${isActive ? styles.active : ""}`}
		>
			<div className={styles.section}>
				<h2>Basic Information</h2>
				<div className={styles.grid}>
					<div className={styles.field}>
						<label htmlFor="ebook_template_id">Template</label>
						<select
							id="ebook_template_id"
							name="ebook_template_id"
							value={formData.ebook_template_id}
							onChange={handleChange}
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
				<div className={styles.field}>
					<label htmlFor="ebook_user_content_title">Title</label>
					<input
						type="text"
						id="ebook_user_content_title"
						name="ebook_user_content_title"
						value={formData.ebook_user_content_title}
						onChange={handleChange}
						placeholder="Enter ebook title"
						disabled={isPublished}
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
						disabled={isPublished}
					/>
				</div>
			</div>

			{/* Save Changes Button - Only in Basic Information Tab */}
			<div className={styles.actions}>
				<button
					type="submit"
					className={styles.submitBtn}
					disabled={isPublished}
				>
					Save Changes
				</button>
			</div>
		</div>
	);
}
