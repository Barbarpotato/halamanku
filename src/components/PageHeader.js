"use client";

import { useState } from "react";
import Link from "next/link";

export default function PageHeader({ user, ebookUser, showUserInfo = false }) {
	const [menuOpen, setMenuOpen] = useState(false);

	console.log(user);

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
											alt="Profile picture"
											class="inline-block size-6 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
										/>
										<div className="flex flex-col ml-1">
											<span className="user-email block text-xs sm:text-sm text-gray-600">
												{user?.user_metadata?.full_name}
											</span>
										</div>
									</div>
									<hr className="my-2 border-gray-200" />
									<div className="flex items-center py-1">
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
												Sign Out
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
								alt="Profile picture"
								class="inline-block size-6 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
							/>
							<div className="flex flex-col ml-1">
								<span className="user-email block text-xs sm:text-sm text-gray-600">
									{user?.user_metadata?.full_name}
								</span>
							</div>
						</div>
						<hr className="my-2 border-gray-200" />
						<div className="flex items-center py-1">
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
									Sign Out
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
