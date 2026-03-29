"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PageHeader({ user, ebookUser, showUserInfo = false }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();

	return (
		<header className="header">
			<div className="header-content">
				<div className="logo">
					<img
						src="/halamanku.png"
						alt="Halamanku"
						width="32"
						height="32"
					/>
					<span className="text-sm sm:text-base">Halamanku</span>
				</div>

				{showUserInfo && user && (
					<div className="relative">
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className="p-2 text-gray-600 hover:text-gray-900"
							aria-label="Menu"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M3 12h18M3 6h18M3 18h18" />
							</svg>
						</button>

						{/* Desktop dropdown */}
						{menuOpen && (
							<div className="hidden md:block absolute right-0 top-full w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
								<div className="p-3">
									<div className="flex items-center py-1">
										<img
											src={user?.user_metadata?.picture}
											alt="Gambar profil"
											className="inline-block size-6 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
										/>
										<div className="flex flex-col ml-1">
											<span className="user-email block text-xs sm:text-sm text-gray-600">
												{user?.user_metadata?.full_name}
											</span>
										</div>
									</div>
									<div className="flex items-center py-1 cursor-pointer">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="text-gray-600"
										>
											<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
										<div className="flex flex-col ml-1">
											<span
												className="user-email block text-xs sm:text-sm text-gray-600"
												onClick={() =>
													router.push(
														"/dashboard/settings",
													)
												}
											>
												Pengaturan
											</span>
										</div>
									</div>
									<hr className="my-2 border-gray-200" />
									<div className="flex items-center py-1 cursor-pointer">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="text-gray-600"
										>
											<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
											<polyline points="16,17 21,12 16,7" />
											<line
												x1="21"
												y1="12"
												x2="9"
												y2="12"
											/>
										</svg>
										<div className="flex flex-col ml-1">
											<form
												id="signout-form-desktop"
												action="/auth/signout"
												method="post"
											></form>
											<span
												className="user-email block text-xs sm:text-sm text-gray-600"
												onClick={() =>
													document
														.getElementById(
															"signout-form-desktop",
														)
														.submit()
												}
											>
												Keluar
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Mobile menu */}
			{menuOpen && showUserInfo && user && (
				<div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
					<div className="p-3">
						<div className="flex items-center py-1">
							<img
								src={user?.user_metadata?.picture}
								alt="Gambar profil"
								className="inline-block size-6 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
							/>
							<div className="flex flex-col ml-1">
								<span className="user-email block text-xs sm:text-sm text-gray-600">
									{user?.user_metadata?.full_name}
								</span>
							</div>
						</div>
						<div className="flex items-center py-1 cursor-pointer">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="text-gray-600"
							>
								<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							<div className="flex flex-col ml-1">
								<span
									className="user-email block text-xs sm:text-sm text-gray-600"
									onClick={() =>
										router.push("/dashbord/settings")
									}
								>
									Pengaturan
								</span>
							</div>
						</div>
						<hr className="my-2 border-gray-200" />
						<div className="flex items-center py-1 cursor-pointer">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="text-gray-600"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16,17 21,12 16,7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							<div className="flex flex-col ml-1">
								<form
									id="signout-form-mobile"
									action="/auth/signout"
									method="post"
								></form>
								<span
									className="user-email block text-xs sm:text-sm text-gray-600"
									onClick={() =>
										document
											.getElementById(
												"signout-form-mobile",
											)
											.submit()
									}
								>
									Keluar
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
