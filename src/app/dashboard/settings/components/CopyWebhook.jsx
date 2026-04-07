// CopyWebhook.jsx
"use client";

import { useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";

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
						<MdCheck size={16} />
						Disalin
					</>
				) : (
					<>
						<MdContentCopy size={16} />
						Salin
					</>
				)}
			</button>
		</div>
	);
}
