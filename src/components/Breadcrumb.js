import Link from "next/link";

const HomeIcon = () => (
	<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
		<path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V18a2 2 0 002 2h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a2 2 0 002-2v-5.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
	</svg>
);

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
									<HomeIcon />
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
