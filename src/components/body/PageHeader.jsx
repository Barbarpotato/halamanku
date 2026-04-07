"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdMenu, MdSettings, MdLogout } from "react-icons/md";

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
							<MdMenu size={24} />
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
										<MdSettings
											size={24}
											className="text-gray-600"
										/>
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
										<MdLogout
											size={24}
											className="text-gray-600"
										/>
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
							<MdSettings size={24} className="text-gray-600" />
							<div className="flex flex-col ml-1">
								<span
									className="user-email block text-xs sm:text-sm text-gray-600"
									onClick={() =>
										router.push("/dashboard/settings")
									}
								>
									Pengaturan
								</span>
							</div>
						</div>
						<hr className="my-2 border-gray-200" />
						<div className="flex items-center py-1 cursor-pointer">
							<MdLogout size={24} className="text-gray-600" />
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
