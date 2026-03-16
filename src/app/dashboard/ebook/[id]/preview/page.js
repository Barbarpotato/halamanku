import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PreviewContent from "./PreviewContent";

export default async function PreviewPage({ params }) {
	const supabase = await createClient();
	const { id } = params;

	// Check authentication
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Get the ebook_user data
	const { data: ebookUser } = await supabase
		.from("ebook_user")
		.select("*")
		.eq("auth_user_id", user.id)
		.single();

	if (!ebookUser) {
		redirect("/login");
	}

	// Get the content data
	const { data: content, error } = await supabase
		.from("ebook_user_content")
		.select("*")
		.eq("id", id)
		.eq("ebook_user_id", ebookUser.id)
		.single();

	if (error || !content) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<h1>Content not found</h1>
				<a href="/dashboard">Go back to dashboard</a>
			</div>
		);
	}

	// Get the template data if available
	let template = null;
	if (content.ebook_template_id) {
		const { data: templateData } = await supabase
			.from("ebook_template")
			.select("*")
			.eq("id", content.ebook_template_id)
			.single();
		template = templateData;
	}

	return <PreviewContent content={content} template={template} />;
}
