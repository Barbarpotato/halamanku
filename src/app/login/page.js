import LoginPage from "./index";

// small utility (you should extract this later)
function safeNext(next, fallback = "/dashboard") {
	return next && next.startsWith("/") ? next : fallback;
}

export default async function Page({ searchParams }) {
	// ✅ MUST await in latest Next.js
	const params = await searchParams;

	const next = safeNext(params?.next);

	return <LoginPage next={next} />;
}
