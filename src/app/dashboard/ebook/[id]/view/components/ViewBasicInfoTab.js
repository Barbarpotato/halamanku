"use client";

import styles from "../../../new/new.module.css";

export default function ViewBasicInfoTab({ isActive, content, templates }) {
	// Find the template name
	const template = templates?.find((t) => t.id === content.ebook_template_id);

	return (
		<div
			className={`${styles.tabContent} ${isActive ? styles.active : ""}`}
		>
			<div className={styles.section}>
				<h2>Basic Information</h2>
				<div className={styles.grid}>
					<div className={styles.field}>
						<label>Template</label>
						<div className={styles.fieldValue}>
							{template?.template_name || "No template selected"}
						</div>
					</div>
				</div>
				<div className={styles.field}>
					<label>Title</label>
					<div className={styles.fieldValue}>
						{content.ebook_user_content_title || "Untitled"}
					</div>
				</div>
				<div className={styles.field}>
					<label>Description</label>
					<div className={styles.fieldValue}>
						{content.ebook_user_content_description ||
							"No description provided."}
					</div>
				</div>
			</div>
		</div>
	);
}
