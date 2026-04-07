import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/utils/encryption";

export async function GET() {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { data: ebookUser, error } = await supabase
			.from("ebook_user")
			.select("lynk_id_merchant_key")
			.eq("auth_user_id", user.id)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		let decryptedKey = "";
		if (ebookUser?.lynk_id_merchant_key) {
			try {
				decryptedKey = decrypt(ebookUser.lynk_id_merchant_key);
			} catch (decryptError) {
				// If decryption fails, perhaps it's old plain text, return as is
				decryptedKey = ebookUser.lynk_id_merchant_key;
			}
		}

		return NextResponse.json({ merchantKey: decryptedKey });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request) {
	try {
		const supabase = await createClient();
		const { merchantKey } = await request.json();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const encryptedKey = encrypt(merchantKey);

		const { error } = await supabase
			.from("ebook_user")
			.update({ lynk_id_merchant_key: encryptedKey })
			.eq("auth_user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
