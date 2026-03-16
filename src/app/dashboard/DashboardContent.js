"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardContent({ user, ebookUser, userContents }) {
	return (
		<div className={styles.dashboard}>
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.logo}>
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>Ebook Admin</span>
					</div>
					<div className={styles.userInfo}>
						<div className={styles.userDetails}>
							<span className={styles.userName}>
								{ebookUser?.name || user.email}
							</span>
							<span className={styles.userEmail}>
								{user.email}
							</span>
						</div>
						<form action="/auth/signout" method="post">
							<button className={styles.logoutBtn} type="submit">
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.pageHeader}>
					<div>
						<h1>My Ebooks</h1>
						<p>Manage your ebook content</p>
					</div>
					<Link
						href="/dashboard/ebook/new"
						className={styles.createBtn}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 5v14M5 12h14"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
						Create New Ebook
					</Link>
				</div>

				{userContents && userContents.length > 0 ? (
					<div className={styles.contentGrid}>
						{userContents.map((content) => (
							<div
								key={content.id}
								className={styles.contentCard}
							>
								<div className={styles.cardHeader}>
									<span className={styles.contentNumber}>
										{content.ebook_user_content_number}
									</span>
									<span
										className={`${styles.status} ${content.is_published ? styles.published : styles.draft}`}
									>
										{content.is_published
											? "Published"
											: "Draft"}
									</span>
								</div>
								<h3>
									{content.ebook_user_content_title ||
										"Untitled"}
								</h3>
								<p className={styles.description}>
									{content.ebook_user_content_description ||
										"No description"}
								</p>
								<div className={styles.cardFooter}>
									<span className={styles.template}>
										{content.ebook_template
											?.template_name ||
											content.ebook_template
												?.repository_name ||
											"None"}
									</span>
									<div className={styles.actions}>
										<Link
											href={`/dashboard/ebook/${content.id}/view`}
											className={styles.actionBtn}
										>
											View
										</Link>
										{!content.is_published && (
											<Link
												href={`/dashboard/ebook/${content.id}/edit`}
												className={styles.actionBtn}
											>
												Edit
											</Link>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={styles.emptyState}>
						<svg
							width="64"
							height="64"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
								stroke="#CBD5E1"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
								stroke="#CBD5E1"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<h3>No ebooks yet</h3>
						<p>Create your first ebook to get started</p>
					</div>
				)}
			</main>
		</div>
	);
}
