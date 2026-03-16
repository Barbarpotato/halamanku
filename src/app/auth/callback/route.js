import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/dashboard";

	if (code) {
		const supabase = await createClient();

		// Exchange code for session
		const { data: sessionData, error: sessionError } =
			await supabase.auth.exchangeCodeForSession(code);

		if (sessionError) {
			console.error("Error exchanging code for session:", sessionError);
			return NextResponse.redirect(`${origin}/login?error=auth_error`);
		}

		const user = sessionData.user;

		if (user) {
			// Check if user exists in ebook_user table
			const { data: existingUser, error: fetchError } = await supabase
				.from("ebook_user")
				.select("*")
				.eq("auth_user_id", user.id)
				.single();

			if (fetchError && fetchError.code !== "PGRST116") {
				console.error("Error fetching user:", fetchError);
			}

			// If user doesn't exist, create them in ebook_user table
			if (!existingUser) {
				const { error: insertError } = await supabase
					.from("ebook_user")
					.insert([
						{
							auth_user_id: user.id,
							email_address: user.email,
							name:
								user.user_metadata?.full_name ||
								user.email?.split("@")[0] ||
								"User",
							user_number: `USR${Date.now()}`,
							is_premium: false,
						},
					]);

				if (insertError) {
					console.error("Error creating user:", insertError);
				}
			}
		}

		// Redirect to dashboard
		return NextResponse.redirect(`${origin}${next}`);
	}

	// No code provided, redirect to login
	return NextResponse.redirect(`${origin}/login`);
}
