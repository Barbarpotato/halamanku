import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ViewEbookForm from "./ViewEbookForm";

export default async function ViewEbookPage({ params }) {
	const supabase = await createClient();
	const { id } = await params;

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

	// Get the ebook content
	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select("*")
		.eq("id", id)
		.eq("ebook_user_id", ebookUser.id)
		.single();

	if (contentError || !content) {
		redirect("/dashboard");
	}

	// Get templates for the view
	const { data: templates } = await supabase
		.from("ebook_template")
		.select("*")
		.order("created", { ascending: false });

	return (
		<ViewEbookForm
			user={user}
			ebookUser={ebookUser}
			content={content}
			templates={templates || []}
		/>
	);
}
