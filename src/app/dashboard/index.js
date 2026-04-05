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
						<h1 className="page-header-title">Dasbor</h1>
						<p className="page-header-description">
							Kelola konten Anda
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
						{userContents.map((content) => (
							<div
								key={content.id}
								className="bg-white p-6 rounded-lg shadow-md border"
							>
								<h3 className="text-lg font-semibold mb-2 text-gray-800">
									{content.ebook_user_content_title
										? content.ebook_user_content_title.slice(
												0,
												100,
											) +
											(content.ebook_user_content_title
												.length > 100
												? "..."
												: "")
										: "Tidak ada judul"}
								</h3>
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
										: "Tidak ada deskripsi"}
								</p>
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										{content.is_private ? (
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-gray-500"
											>
												<path d="M12 17c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM3 7V5a5 5 0 0110 0v2M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
											</svg>
										) : (
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-gray-500"
											>
												<circle
													cx="12"
													cy="12"
													r="10"
												/>
												<path d="M2 12h20" />
												<path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
											</svg>
										)}
										<span
											className={`badge ${content.is_published ? "badge-published" : "badge-draft"}`}
										>
											{content.is_published
												? "Diterbitkan"
												: "Draf"}
										</span>
									</div>
									<div className="flex gap-2">
										<Link
											href={`/dashboard/${content.ebook_user_content_number}/detail/general`}
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
						<h3>Belum ada ebook</h3>
						<p>Buat ebook pertama Anda untuk memulai</p>
					</div>
				)}
			</main>
		</div>
	);
}
