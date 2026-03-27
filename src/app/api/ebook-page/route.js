import { NextRequest } from "next/server";

const SERVICE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const FUNCTION_URL = `${SERVICE_URL}/functions/v1/ebook-shard-service`;

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);

		const contentNumber = searchParams.get("contentNumber");
		const page = searchParams.get("page");

		const authHeader = req.headers.get("authorization");

		if (!authHeader) {
			return new Response("Unauthorized", { status: 401 });
		}

		const res = await fetch(
			`${FUNCTION_URL}?content_number=${contentNumber}&page=${page}`,
			{
				headers: {
					Authorization: authHeader,
				},
			},
		);

		if (!res.ok) {
			return new Response("Failed to fetch signed URL", { status: 500 });
		}

		const json = await res.json();
		const signedUrl = json?.data?.signed_url;

		if (!signedUrl) {
			return new Response("No image", { status: 404 });
		}

		const imageRes = await fetch(signedUrl);
		const buffer = await imageRes.arrayBuffer();

		return new Response(buffer, {
			headers: {
				"Content-Type": "image/jpeg",
				"Cache-Control": "no-store",
			},
		});
	} catch (e) {
		console.log(e);
	}
}
