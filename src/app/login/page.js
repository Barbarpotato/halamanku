import LoginPage from "./index";

export default function Page({ searchParams }) {
	const next = searchParams?.next || "/dashboard";

	return <LoginPage next={next} />;
}
