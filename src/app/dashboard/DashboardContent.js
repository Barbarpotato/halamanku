"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function DashboardContent({ user, ebookUser, userContents }) {
	return (
		<div className="page-container">
			<PageHeader user={user} ebookUser={ebookUser} showUserInfo={true} />

			<main className="main">
				<div className="page-header">
					<div>
						<h1 className="page-header-title">Dashboard</h1>
						<p className="page-header-description">
							Manage your ebook content
						</p>
					</div>
					<Link
						href="/dashboard/ebook/new"
						prefetch
						className="btn-create"
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
					</Link>
				</div>

				{userContents && userContents.length > 0 ? (
					<div className="table-container">
						<table className="modern-table">
							<thead>
								<tr>
									<th>Title</th>
									<th>Description</th>
									<th>Template</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{userContents.map((content) => (
									<tr key={content.id}>
										<td>
											{content.ebook_user_content_title ||
												"Untitled"}
										</td>
										<td>
											{content.ebook_user_content_description
												? content.ebook_user_content_description.slice(
														0,
														350,
													) +
													(content
														.ebook_user_content_description
														.length > 350
														? "..."
														: "")
												: "No description"}
										</td>
										<td>
											{content.ebook_template
												?.template_name ||
												content.ebook_template
													?.repository_name ||
												"None"}
										</td>
										<td>
											<span
												className={`badge ${content.is_published ? "badge-published" : "badge-draft"}`}
											>
												{content.is_published
													? "Published"
													: "Draft"}
											</span>
										</td>
										<td>
											<div className="table-actions">
												<Link
													href={`/dashboard/ebook/${content.id}/view`}
													prefetch
													className="btn-action"
												>
													View
												</Link>
												{!content.is_published && (
													<Link
														href={`/dashboard/ebook/${content.id}/edit`}
														prefetch
														className="btn-action"
													>
														Edit
													</Link>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
