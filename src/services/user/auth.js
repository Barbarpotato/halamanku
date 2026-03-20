import { createClient } from "@/lib/supabase/server";

export const getAuthenticatedUser = async () => {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user;
};

export const getEbookUser = async (userId) => {
	const supabase = await createClient();

	const { data: ebookUser } = await supabase
		.from("ebook_user")
		.select("*")
		.eq("auth_user_id", userId)
		.single();

	return ebookUser;
};
