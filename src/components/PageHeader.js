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
					<img
						src="/halamanku.png"
						alt="Halamanku"
						width="32"
						height="32"
					/>
					<span>Halamanku</span>
				</div>

				{breadcrumb && (
					<div className="breadcrumb">
						{breadcrumb.map((item, index) => (
							<span key={index}>
								{index > 0 && <span>/</span>}
								{item.href ? (
									<Link href={item.href} prefetch>
										{item.label}
									</Link>
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
