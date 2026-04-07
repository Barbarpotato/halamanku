"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { MdChevronRight } from "react-icons/md";

export default function TabNavigation({ content }) {
	const router = useRouter();
	const params = useParams();
	const pathname = usePathname();
	const [hasOverflow, setHasOverflow] = useState(false);
	const tabsRef = useRef(null);

	// Determine active tab based on pathname
	const getActiveTab = () => {
		if (pathname.endsWith("/general")) return "basic";
		if (pathname.endsWith("/access")) return "access";
		if (pathname.endsWith("/interaction")) return "interaction";
		// Default for main detail page
		return "basic";
	};

	const activeTab = getActiveTab();

	// Check for tab overflow
	useEffect(() => {
		const checkOverflow = () => {
			if (tabsRef.current) {
				const { scrollWidth, clientWidth } = tabsRef.current;
				setHasOverflow(scrollWidth > clientWidth);
			}
		};

		checkOverflow();
		window.addEventListener("resize", checkOverflow);

		return () => window.removeEventListener("resize", checkOverflow);
	}, []);

	return (
		<div
			ref={tabsRef}
			className={`tabs-container ${hasOverflow ? "has-overflow" : ""}`}
		>
			<button
				type="button"
				className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
				onClick={() =>
					router.push(
						`/dashboard/${params.content_number}/detail/general`,
					)
				}
			>
				Umum
			</button>

			{content.is_published == true && content.is_private && (
				<button
					type="button"
					className={`tab-button ${activeTab === "access" ? "active" : ""}`}
					onClick={() =>
						router.push(
							`/dashboard/${params.content_number}/detail/access`,
						)
					}
				>
					Akses
				</button>
			)}

			<button
				type="button"
				className={`tab-button ${activeTab === "interaction" ? "active" : ""}`}
				onClick={() =>
					router.push(
						`/dashboard/${params.content_number}/detail/interaction`,
					)
				}
			>
				Interaksi
			</button>

			{hasOverflow && (
				<div className="scroll-indicator">
					<MdChevronRight size={16} />
				</div>
			)}
		</div>
	);
}
