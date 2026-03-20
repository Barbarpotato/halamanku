export const validateEbookUserContentForm = (formData, ebookUser) => {
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
