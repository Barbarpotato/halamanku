"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function Index({ user, ebookUser, userContents }) {
	return (
		<div className="page-container">
			<PageHeader user={user} ebookUser={ebookUser} showUserInfo={true} />

			<main className="main">
				<div className="page-header">
					<div>
						<h1 className="page-header-title">Dashboard</h1>
						<p className="page-header-description">
							Manage your content
						</p>
					</div>
					<Link href="/dashboard/new" prefetch className="btn-create">
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
					</Link>
				</div>

				{userContents && userContents.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{userContents.map((content) => (
							<div
								key={content.id}
								className="bg-white p-6 rounded-lg shadow-md border"
							>
								<h3 className="text-lg font-semibold mb-2">
									{content.ebook_user_content_title ||
										"Untitled"}
								</h3>
								<p className="text-sm text-gray-500 mb-2">
									Template:{" "}
									{content.ebook_template?.template_name ||
										content.ebook_template
											?.repository_name ||
										"None"}
								</p>
								<p className="text-gray-600 mb-4">
									{content.ebook_user_content_description
										? content.ebook_user_content_description.slice(
												0,
												150,
											) +
											(content
												.ebook_user_content_description
												.length > 150
												? "..."
												: "")
										: "No description"}
								</p>
								<div className="flex justify-between items-center">
									<span
										className={`badge ${content.is_published ? "badge-published" : "badge-draft"}`}
									>
										{content.is_published
											? "Published"
											: "Draft"}
									</span>
									<div className="flex gap-2">
										<Link
											href={`/dashboard/${content.ebook_user_content_number}/detail`}
											prefetch
											className="btn-action"
										>
											Detail
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="empty-state">
						<h3>No ebooks yet</h3>
						<p>Create your first ebook to get started</p>
					</div>
				)}
			</main>
		</div>
	);
}
