"use client";

import { useState, useEffect } from "react";

export default function ReactionsTab({ content }) {
	const [reactions, setReactions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [respondingTo, setRespondingTo] = useState(null);
	const [responseText, setResponseText] = useState("");

	const fetchReactions = async () => {
		setLoading(true);
		try {
			const res = await fetch(
				`/api/ebook-user-content-reaction?contentId=${content.id}`,
			);
			const data = await res.json();
			setReactions(data.data || []);
		} catch (error) {
			console.error("Failed to fetch reactions", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReactions();
	}, [content.id]);

	const handleRespond = async (reactionId) => {
		try {
			const res = await fetch("/api/ebook-user-content-reaction", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "respond",
					reactionId,
					authorResponse: responseText,
				}),
			});
			if (res.ok) {
				fetchReactions();
				setRespondingTo(null);
				setResponseText("");
			} else {
				alert("Error submitting response");
			}
		} catch (error) {
			console.error("Failed to respond", error);
		}
	};

	const handleHighlight = async (reactionId, isHighlight) => {
		try {
			const res = await fetch("/api/ebook-user-content-reaction", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: isHighlight ? "unhighlight" : "highlight",
					reactionId,
				}),
			});
			if (res.ok) {
				fetchReactions();
			} else {
				alert("Error updating highlight");
			}
		} catch (error) {
			console.error("Failed to toggle highlight", error);
		}
	};

	const canEdit = (reaction) => !reaction.author_response;
	const isLocked = (reaction) => reaction.update_attempt >= 3;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Reaksi Pembaca
				</h3>
				<p className="text-gray-600">
					Kelola interaksi pembaca dengan ebook Anda.
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center items-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-2 text-gray-600">Memuat reaksi...</span>
				</div>
			) : reactions.length === 0 ? (
				<div className="text-center py-12">
					<div className="mx-auto h-12 w-12 text-gray-400">
						<svg
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						Belum ada reaksi
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Reaksi pembaca akan muncul di sini setelah mereka
						berinteraksi dengan ebook Anda.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{reactions.map((reaction) => (
						<div
							key={reaction.id}
							className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
						>
							<div className="p-6">
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											<span className="font-medium text-gray-900">
												{
													reaction.react_user_email_address
												}
											</span>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
												Halaman {reaction.page_number}
											</span>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													reaction.react_type ===
													"ANSWER"
														? "bg-blue-100 text-blue-800"
														: "bg-green-100 text-green-800"
												}`}
											>
												{reaction.react_type}
											</span>
											{reaction.emotion_type && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
													{reaction.emotion_type}
												</span>
											)}
											{reaction.is_highlight && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
													⭐ Highlighted
												</span>
											)}
											{isLocked(reaction) && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
													🔒 Locked
												</span>
											)}
										</div>
										<p className="text-gray-900 leading-relaxed">
											{reaction.react_description}
										</p>
									</div>
								</div>

								{reaction.author_response && (
									<div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
										<div className="flex">
											<div className="ml-3">
												<p className="text-sm font-medium text-blue-900">
													Respon Author
												</p>
												<p className="mt-1 text-sm text-blue-700">
													{reaction.author_response}
												</p>
											</div>
										</div>
									</div>
								)}

								<div className="mt-4 flex flex-col sm:flex-row gap-3">
									{!reaction.author_response && (
										<>
											{respondingTo === reaction.id ? (
												<div className="flex-1 space-y-3">
													<textarea
														value={responseText}
														onChange={(e) =>
															setResponseText(
																e.target.value,
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
														placeholder="Tulis respon Anda..."
														rows={3}
													/>
													<div className="flex gap-2">
														<button
															onClick={() =>
																handleRespond(
																	reaction.id,
																)
															}
															className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
														>
															Kirim Respon
														</button>
														<button
															onClick={() =>
																setRespondingTo(
																	null,
																)
															}
															className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
														>
															Batal
														</button>
													</div>
												</div>
											) : (
												<button
													onClick={() =>
														setRespondingTo(
															reaction.id,
														)
													}
													className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
												>
													Respon
												</button>
											)}
										</>
									)}
									<button
										onClick={() =>
											handleHighlight(
												reaction.id,
												reaction.is_highlight,
											)
										}
										className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
											reaction.is_highlight
												? "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
												: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500"
										}`}
									>
										{reaction.is_highlight
											? "Hapus Highlight"
											: "Highlight"}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
