import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Index from "./index";

export default async function DashboardPage() {
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

	// Get user's content
	const { data: userContents } = await supabase
		.from("ebook_user_content")
		.select(`*`)
		.eq("ebook_user_id", ebookUser?.id)
		.order("created", { ascending: false });

	return (
		<Index
			user={user}
			ebookUser={ebookUser}
			userContents={userContents || []}
		/>
	);
}
