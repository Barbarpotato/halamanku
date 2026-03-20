"use client";

import Link from "next/link";

export default function PageHeader({
	user,
	ebookUser,
	showUserInfo = false,
	breadcrumb = null,
}) {
	return (
		<header className="header">
			<div className="header-content">
				<div className="logo">
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

				{breadcrumb && (
					<div className="breadcrumb">
						{breadcrumb.map((item, index) => (
							<span key={index}>
								{index > 0 && <span>/</span>}
								{item.href ? (
									<Link href={item.href}>{item.label}</Link>
								) : (
									<span style={{ marginLeft: "5px" }}>
										{item.label}
									</span>
								)}
							</span>
						))}
					</div>
				)}

				{showUserInfo && user && (
					<div className="user-info">
						<div className="user-details">
							<span className="user-name">
								{ebookUser?.name || user.email}
							</span>
							<span className="user-email">{user.email}</span>
						</div>
						<form action="/auth/signout" method="post">
							<button className="btn-logout" type="submit">
								Sign Out
							</button>
						</form>
					</div>
				)}
			</div>
		</header>
	);
}
