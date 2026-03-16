import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ViewEbookContent from "./ViewEbookContent";

export default async function ViewEbookPage({ params }) {
	const supabase = await createClient();
	const { id } = params;

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

	// Get the ebook content with template info
	const { data: content } = await supabase
		.from("ebook_user_content")
		.select(
			`
      *,
      ebook_template:ebook_template_id(
        id,
        owner_name,
        repository_name,
        branch_name,
        file_path,
        is_premium,
		template_name
      )
    `,
		)
		.eq("id", id)
		.eq("ebook_user_id", ebookUser.id)
		.single();

	if (!content) {
		redirect("/dashboard");
	}

	return (
		<ViewEbookContent user={user} ebookUser={ebookUser} content={content} />
	);
}
