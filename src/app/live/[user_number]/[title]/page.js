import { createClient } from "@/lib/supabase/server";
import styles from "./live.module.css";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }) {
	const { user_number: userNumberParam, title: titleParam } = await params;

	// Decode and convert hyphens back to whitespace
	const userNumber = decodeURIComponent(userNumberParam);
	const title = decodeURIComponent(titleParam).replace(/-/g, " ");

	const supabase = await createClient();

	// Step 1: Validate user_number from ebook_user table
	const { data: ebookUser, error: ebookUserError } = await supabase
		.from("ebook_user")
		.select("id, user_number")
		.eq("user_number", userNumber)
		.single();

	if (ebookUserError || !ebookUser) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h1>Content Not Found</h1>
					<p>
						The requested content could not be found. Invalid user
						number.
					</p>
				</div>
			</div>
		);
	}

	// Step 2: Validate title from ebook_user_content table
	const { data: content, error: contentError } = await supabase
		.from("ebook_user_content")
		.select(
			"id, ebook_user_content_title, publish_site_url, is_published, publish_worker_status",
		)
		.eq("ebook_user_content_title", title)
		.eq("ebook_user_id", ebookUser.id)
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

	// Step 3: Check if content is actually published
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

	// Step 4: Check if publish_site_url exists
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

	// Render the iframe with the published site URL
	return (
		<div className={styles.container}>
			<iframe
				src={content.publish_site_url}
				className={styles.iframe}
				title={content.ebook_user_content_title}
				frameBorder="0"
				allowFullScreen
			/>
		</div>
	);
}
