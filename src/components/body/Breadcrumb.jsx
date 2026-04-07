import Link from "next/link";
import { MdHome } from "react-icons/md";

export default function Breadcrumb({ items }) {
	return (
		<nav aria-label="Breadcrumb" className="text-sm text-gray-600">
			<ol className="flex items-center space-x-1">
				{items.map((item, index) => (
					<li key={index} className="flex items-center">
						{index > 0 && (
							<span className="mx-1 text-gray-400">/</span>
						)}
						{item.href ? (
							<Link
								href={item.href}
								className={`flex items-center ${item.href === "/" ? "text-blue-600 hover:text-blue-800" : "text-blue-600 hover:text-blue-800 hover:underline"}`}
							>
								{item.href === "/dashboard" ? (
									<MdHome size={16} />
								) : (
									item.label
								)}
							</Link>
						) : (
							<span className="text-gray-800 font-medium">
								{item.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
