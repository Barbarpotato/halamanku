import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewEbookForm from "./NewEbookForm";

export default async function NewEbookPage() {
	const supabase = await createClient();

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

	// Get templates for the dropdown
	const { data: templates } = await supabase
		.from("ebook_template")
		.select("*")
		.order("created", { ascending: false });

	return (
		<NewEbookForm
			user={user}
			ebookUser={ebookUser}
			templates={templates || []}
		/>
	);
}
