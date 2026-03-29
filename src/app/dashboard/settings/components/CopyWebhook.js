// CopyWebhook.jsx
"use client";

import { useState } from "react";

export default function CopyWebhook({ url }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<code
				onClick={handleCopy}
				className="flex-1 bg-gray-100 p-2 rounded text-gray-800 text-sm break-all cursor-pointer"
			>
				{url}
			</code>

			<button
				onClick={handleCopy}
				className="flex items-center gap-1 px-3 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition"
			>
				{copied ? (
					<>
						{/* Check */}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						Disalin
					</>
				) : (
					<>
						{/* Copy */}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" />
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
						</svg>
						Salin
					</>
				)}
			</button>
		</div>
	);
}
