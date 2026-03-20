"use client";

export default function ViewBasicInfoTab({ content, templates }) {
	// Find the template name
	const template = templates?.find((t) => t.id === content.ebook_template_id);

	return (
		<div className="mb-xl">
			<h2 className="section-title">Basic Information</h2>
			<div className="grid-auto-fit">
				<div className="field">
					<label className="field-label">Template</label>
					<div className="field-value">
						{template?.template_name || "No template selected"}
					</div>
				</div>
			</div>
			<div className="field">
				<label className="field-label">Title</label>
				<div className="field-value">
					{content.ebook_user_content_title || "Untitled"}
				</div>
			</div>
			<div className="field">
				<label className="field-label">Description</label>
				<div className="field-value">
					{content.ebook_user_content_description ||
						"No description provided."}
				</div>
			</div>
		</div>
	);
}
