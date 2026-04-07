import { SHARD_URL } from "@/lib/supabase/supabase";

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
			`${SHARD_URL}?content_number=${contentNumber}&page=${page}`,
			{
				headers: {
					Authorization: authHeader,
				},
			},
		);

		if (res.status === 400) {
			return new Response("Bad Request", { status: 400 });
		}

		if (res.status === 401) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (res.status === 403) {
			return new Response("Forbidden", { status: 403 });
		}

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
		console.error(e);
	}
}
