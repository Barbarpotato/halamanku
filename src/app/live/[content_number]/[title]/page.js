import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./live.module.css";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }) {
	const { content_number: contentNumberParam, title: titleParam } = params;

	const contentNumber = decodeURIComponent(contentNumberParam);
	const title = decodeURIComponent(titleParam).replace(/-/g, " ");

	const supabase = await createClient();

	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select(
			"id, ebook_user_content_number, ebook_user_content_title, publish_site_url, is_published, publish_worker_status",
		)
		.eq("ebook_user_content_number", contentNumber)
		.eq("ebook_user_content_title", title)
		.single();

	if (contentError || !content) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Content Not Found</h1>
					<p>
						The requested content could not be found. Invalid title.
					</p>
				</div>
			</div>
		);
	}

	if (
		content.is_published !== true ||
		content.publish_worker_status !== "SUCCESS"
	) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Content Not Available</h1>
					<p>
						This content has not been published yet or is not
						accessible.
					</p>
				</div>
			</div>
		);
	}

	if (!content.publish_site_url) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Content Not Available</h1>
					<p>
						This content is published but the site URL is not
						available.
					</p>
				</div>
			</div>
		);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		const baseUrl =
			process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const currentPath = `/live/${contentNumberParam}/${titleParam}`;
		const redirectTo = `${baseUrl}${currentPath}`;

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo,
			},
		});

		if (error) {
			console.error("OAuth redirect error:", error);
			return (
				<div className={styles.container}>
					<div className={styles.error}>
						<h1>Login Gagal</h1>
						<p>{error.message}</p>
					</div>
				</div>
			);
		}

		if (data.url) {
			redirect(data.url);
		}

		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Silakan Login</h1>
					<p>
						Anda perlu login dengan Google untuk mengakses ebook
						ini.
					</p>
				</div>
			</div>
		);
	}

	const {
		data: { session },
	} = await supabase.auth.getSession();
	const accessToken = session?.access_token;

	if (!accessToken) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Token Tidak Ditemukan</h1>
					<p>
						Terjadi kesalahan saat mengambil token autentikasi. Coba
						login ulang.
					</p>
				</div>
			</div>
		);
	}

	const iframeSrc = `${content.publish_site_url}?token=${encodeURIComponent(accessToken)}`;

	return (
		<div
			className={styles.container}
			style={{ height: "100vh", width: "100%" }}
		>
			<iframe
				src={iframeSrc}
				className={styles.iframe}
				title={content.ebook_user_content_title}
				frameBorder="0"
				allowFullScreen
				style={{ width: "100%", height: "100%", border: "none" }}
			/>
		</div>
	);
}
