import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function GET(request) {
	const { searchParams, origin } = new URL(request.url);

	const code = searchParams.get("code");
	const nextParam = searchParams.get("next");

	let next = "/dashboard";

	if (nextParam) {
		try {
			next = decodeURIComponent(nextParam);
		} catch (e) {
			console.error("Invalid next param");
		}
	}

	if (!code) {
		return NextResponse.redirect(`${origin}/login`);
	}

	const supabase = await createClient();

	const { data: sessionData, error: sessionError } =
		await supabase.auth.exchangeCodeForSession(code);

	if (sessionError) {
		console.error("Error exchanging code for session:", sessionError);
		return NextResponse.redirect(`${origin}/login?error=auth_error`);
	}

	const user = sessionData.user;

	if (user) {
		const { data: existingUser, error: fetchError } = await supabase
			.from("ebook_user")
			.select("id")
			.eq("auth_user_id", user.id)
			.maybeSingle();

		if (fetchError) {
			console.error("Error fetching user:", fetchError);
		}

		if (!existingUser) {
			const { error: insertError } = await supabase
				.from("ebook_user")
				.insert({
					auth_user_id: user.id,
					email_address: user.email,
					name:
						user.user_metadata?.full_name ||
						user.email?.split("@")[0] ||
						"User",
					user_number: `USR-${randomBytes(8).toString("hex")}`,
					is_premium: false,
				});

			if (insertError) {
				console.error("Error creating user:", insertError);
			}
		}
	}

	return NextResponse.redirect(`${origin}${next}`);
}
