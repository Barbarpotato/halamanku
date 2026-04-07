"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/modal/ModalProvider";
import {
	FaRegLightbulb,
	FaRegFileAlt,
	FaPlus,
	FaHeart,
	FaThumbsUp,
	FaEye,
	FaQuestion,
	FaThumbsDown,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa";

const VerticalStepper = ({ totalPages, contentNumber, contentId }) => {
	const router = useRouter();
	const modal = useModal();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPage, setSelectedPage] = useState(null);
	const [pageImageUrl, setPageImageUrl] = useState(null);
	const [loadingPage, setLoadingPage] = useState(false);

	const [showQuestionModal, setShowQuestionModal] = useState(false);
	const [questionFormData, setQuestionFormData] = useState({ question: "" });
	const [creatingQuestion, setCreatingQuestion] = useState(false);
	const [currentQuestionPage, setCurrentQuestionPage] = useState(null);
	const [modalMode, setModalMode] = useState("create");
	const [editingQuestion, setEditingQuestion] = useState(null);

	const [reactions, setReactions] = useState([]);
	const [questions, setQuestions] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [tokenReady, setTokenReady] = useState(false);
	const [expandedPages, setExpandedPages] = useState(new Set([1]));
	const [jumpToPage, setJumpToPage] = useState("");

	const tokenRef = useRef(null);
	const supabase = useMemo(() => createClient(), []);

	// Group data by page
	const pageData = useMemo(() => {
		const data = {};
		for (let i = 1; i <= totalPages; i++) {
			data[i] = {
				reactions: reactions.filter((r) => r.page_number === i),
				questions: questions.filter((q) => q.page_number === i),
			};
		}
		return data;
	}, [reactions, questions, totalPages]);

	// Fetch token
	useEffect(() => {
		const getToken = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.access_token) {
				tokenRef.current = session.access_token;
				setTokenReady(true);
			}
		};
		getToken();
	}, [supabase]);

	// Fetch reactions and questions
	useEffect(() => {
		const fetchData = async () => {
			if (!tokenReady || !contentId) return;

			try {
				const [reactionsRes, questionsRes] = await Promise.all([
					fetch(
						`/api/ebook-user-content-reaction?contentId=${contentId}`,
						{
							headers: {
								Authorization: `Bearer ${tokenRef.current}`,
							},
						},
					),
					fetch(
						`/api/ebook-user-content-question?contentId=${contentId}`,
						{
							headers: {
								Authorization: `Bearer ${tokenRef.current}`,
							},
						},
					),
				]);

				if (reactionsRes.ok) {
					const reactionsData = await reactionsRes.json();
					setReactions(reactionsData.data || []);
				}
				if (questionsRes.ok) {
					const questionsData = await questionsRes.json();
					setQuestions(questionsData.data || []);
				}
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setLoadingData(false);
			}
		};

		fetchData();
	}, [contentId, tokenReady]);

	// Refresh data after mutation
	const refreshData = async () => {
		router.refresh();
		try {
			const res = await fetch(
				`/api/ebook-user-content-question?contentId=${contentId}`,
				{
					headers: { Authorization: `Bearer ${tokenRef.current}` },
				},
			);
			if (res.ok) {
				setQuestions((await res.json()).data || []);
			}
		} catch (err) {
			console.error("Failed to refresh questions:", err);
		}
	};

	const togglePage = (pageNum) => {
		setExpandedPages((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(pageNum)) {
				newSet.delete(pageNum);
			} else {
				newSet.add(pageNum);
			}
			return newSet;
		});
	};

	const jumpTo = (pageNum) => {
		const element = document.getElementById(`page-${pageNum}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
			// Auto expand the target page
			setExpandedPages((prev) => new Set([...prev, pageNum]));
		}
		setJumpToPage("");
	};

	const handleOpenPage = async (pageNumber) => {
		setLoadingPage(true);
		try {
			const res = await fetch(
				`/api/ebook-page?contentNumber=${contentNumber}&page=${pageNumber}`,
				{ headers: { Authorization: `Bearer ${tokenRef.current}` } },
			);

			if (!res.ok) throw new Error("Failed to fetch page");

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setPageImageUrl(url);
			setSelectedPage(pageNumber);
			setIsModalOpen(true);
		} catch (err) {
			console.error(err);
			setSelectedPage(pageNumber);
			setIsModalOpen(true);
		} finally {
			setLoadingPage(false);
		}
	};

	const handleCreateQuestion = (pageNumber) => {
		setModalMode("create");
		setEditingQuestion(null);
		setCurrentQuestionPage(pageNumber);
		setQuestionFormData({ question: "" });
		setShowQuestionModal(true);
	};

	const handleSubmitQuestion = async (e) => {
		e.preventDefault();
		if (!questionFormData.question.trim()) return;

		setCreatingQuestion(true);

		const action = modalMode === "edit" ? "update" : "create";
		const payload = {
			action,
			ebookUserContentId: contentId,
			pageNumber: currentQuestionPage,
			question: questionFormData.question,
		};

		if (modalMode === "edit") {
			payload.questionId = editingQuestion.id;
		}

		try {
			const res = await fetch("/api/ebook-user-content-question", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${tokenRef.current}`,
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error(`Failed to ${action} question`);

			await refreshData();
			setShowQuestionModal(false);
			setQuestionFormData({ question: "" });
			setCurrentQuestionPage(null);
			setModalMode("create");
			setEditingQuestion(null);
		} catch (error) {
			console.error(`Failed to ${action} question:`, error);
			modal.show({
				message: `Gagal ${modalMode === "create" ? "menambahkan" : "mengupdate"} pertanyaan`,
			});
		} finally {
			setCreatingQuestion(false);
		}
	};

	const handleEditQuestion = (question) => {
		setModalMode("edit");
		setEditingQuestion(question);
		setCurrentQuestionPage(question.page_number);
		setQuestionFormData({ question: question.question });
		setShowQuestionModal(true);
	};

	const handleDeleteQuestion = async (questionId) => {
		const confirmed = await modal.confirm({
			message: "Apakah Anda yakin ingin menghapus pertanyaan ini?",
		});
		if (!confirmed) return;

		try {
			const res = await fetch("/api/ebook-user-content-question", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${tokenRef.current}`,
				},
				body: JSON.stringify({ action: "delete", questionId }),
			});

			if (!res.ok) throw new Error("Failed to delete question");
			await refreshData();
		} catch (error) {
			console.error("Failed to delete question:", error);
			modal.show({ message: "Gagal menghapus pertanyaan" });
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedPage(null);
		if (pageImageUrl) {
			URL.revokeObjectURL(pageImageUrl);
			setPageImageUrl(null);
		}
	};

	const closeQuestionModal = () => {
		setShowQuestionModal(false);
		setQuestionFormData({ question: "" });
		setCurrentQuestionPage(null);
		setModalMode("create");
		setEditingQuestion(null);
	};

	const getPageStats = (pageNum) => {
		const data = pageData[pageNum] || { reactions: [], questions: [] };

		const answerCount = data.reactions.filter(
			(r) => r.react_type === "ANSWER",
		).length;
		const thoughtCount = data.reactions.filter(
			(r) => r.react_type === "THOUGHT",
		).length;

		const emotionCounts = {
			like: data.reactions.filter((r) => r.emotion_type === "like")
				.length,
			love: data.reactions.filter((r) => r.emotion_type === "love")
				.length,
			thinking: data.reactions.filter(
				(r) => r.emotion_type === "thinking",
			).length,
			seen: data.reactions.filter((r) => r.emotion_type === "seen")
				.length,
			dislike: data.reactions.filter((r) => r.emotion_type === "dislike")
				.length,
			confused: data.reactions.filter(
				(r) => r.emotion_type === "confused",
			).length,
		};

		return {
			answerCount,
			thoughtCount,
			emotionCounts,
			questions: data.questions,
		};
	};

	if (loadingData) {
		return (
			<div className="flex items-center justify-center py-12">
				<div
					className="animate-spin rounded-full h-8 w-8 border-b-2"
					style={{ borderBottomColor: "var(--color-primary)" }}
				/>
			</div>
		);
	}

	return (
		<div className="w-full  mx-auto px-4">
			{/* Toolbar - First & Last Page */}
			<div className="sticky top-3 z-40 bg-white border border-gray-200 shadow-md rounded-2xl p-4 sm:p-5 mb-8">
				<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
					<div className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">
						Lompat ke Halaman
					</div>

					<div className="flex w-full gap-2 sm:gap-3">
						<button
							onClick={() => jumpTo(1)}
							className="px-4 py-3 text-white rounded-xl transition active:scale-95 flex justify-center"
							style={{ backgroundColor: "var(--color-primary)" }}
						>
							<FaChevronUp size={18} />
						</button>

						<input
							type="number"
							min={1}
							max={totalPages}
							value={jumpToPage}
							onChange={(e) => setJumpToPage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									const page = Number(jumpToPage);
									if (page >= 1 && page <= totalPages) {
										jumpTo(page);
										setJumpToPage("");
									}
								}
							}}
							placeholder={`1-${totalPages}`}
							className="flex-1 text-gray-800 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
						/>

						<button
							onClick={() => jumpTo(totalPages)}
							className="px-4 py-3 text-white rounded-xl transition active:scale-95 flex justify-center"
							style={{ backgroundColor: "var(--color-primary)" }}
						>
							<FaChevronDown size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* Vertical Stepper */}
			<div className="relative pl-6 sm:pl-12">
				{/* Vertical Line */}
				<div className="absolute left-4 sm:left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

				{Array.from({ length: totalPages }, (_, i) => {
					const pageNum = i + 1;
					const isExpanded = expandedPages.has(pageNum);
					const {
						answerCount,
						thoughtCount,
						emotionCounts,
						questions,
					} = getPageStats(pageNum);
					const hasQuestion = questions.length > 0;

					return (
						<div
							id={`page-${pageNum}`}
							key={pageNum}
							className="relative mb-10 last:mb-0"
						>
							{/* Step Circle */}
							<div
								className="absolute -left-2 sm:-left-3 w-8 h-8 sm:w-12 sm:h-12 rounded-2xl bg-white border-4 flex items-center justify-center shadow z-10"
								style={{ borderColor: "var(--color-primary)" }}
							>
								<span
									className="font-bold text-lg sm:text-2xl"
									style={{ color: "var(--color-primary)" }}
								>
									{pageNum}
								</span>
							</div>

							{/* Card - Consistent Width */}
							<div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden ml-1 sm:ml-2">
								{/* Header */}
								<div
									onClick={() => togglePage(pageNum)}
									className="flex items-center justify-between px-4 sm:px-7 py-6 cursor-pointer hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<p className="text-sm text-gray-500">
											{questions.length} pertanyaan •{" "}
											{thoughtCount + answerCount}{" "}
											interaksi
										</p>
									</div>

									<div className="flex items-center gap-4">
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleOpenPage(pageNum);
											}}
											className="text-gray-400 hover:text-blue-600 transition-colors"
										>
											<FaRegFileAlt size={23} />
										</button>
										{isExpanded ? (
											<FaChevronUp size={22} />
										) : (
											<FaChevronDown size={22} />
										)}
									</div>
								</div>

								{/* Expandable Content - Fixed & Smooth */}
								<div
									className={`overflow-hidden transition-all duration-300 ${
										isExpanded
											? "max-h-[800px] opacity-100"
											: "max-h-0 opacity-0"
									}`}
								>
									<div className="px-4 sm:px-7 pb-8 border-t border-gray-100">
										{/* Emotion Counters */}
										<div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-6 border-b">
											{[
												{
													icon: FaThumbsUp,
													count: emotionCounts.like,
													color: "text-green-500",
												},
												{
													icon: FaHeart,
													count: emotionCounts.love,
													color: "text-red-500",
												},
												{
													icon: FaRegLightbulb,
													count: thoughtCount,
													color: "text-yellow-500",
												},
												{
													icon: FaEye,
													count: emotionCounts.seen,
													color: "text-gray-500",
												},
												{
													icon: FaQuestion,
													count: emotionCounts.thinking,
													color: "text-purple-500",
												},
												{
													icon: FaThumbsDown,
													count: answerCount,
													color: "",
													style: {
														color: "var(--color-primary)",
													},
												},
											].map((item, idx) => (
												<div
													key={idx}
													className="text-center"
												>
													<item.icon
														className={`${item.color} text-2xl mx-auto mb-1`}
														style={item.style}
													/>
													<div className="font-bold text-gray-900 text-lg">
														{item.count}
													</div>
												</div>
											))}
										</div>

										{/* Overview */}
										<div className="py-6 border-b border-gray-100">
											<div className="font-semibold text-gray-900 mb-4">
												Overview
											</div>
											<div className="grid grid-cols-2 gap-6 text-sm">
												<div className="flex justify-between">
													<span className="text-gray-600">
														Total Thoughts
													</span>
													<span className="font-medium">
														{thoughtCount}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">
														Total Answered
													</span>
													<span className="font-medium">
														{answerCount}
													</span>
												</div>
											</div>
										</div>

										{/* Action Section */}
										<div className="pt-6">
											<div className="font-semibold text-gray-900 mb-4">
												Action
											</div>

											{hasQuestion ? (
												<div className="bg-gray-50 p-4 rounded-xl">
													<p className="text-sm text-gray-800 mb-3 line-clamp-2">
														{questions[0].question}
													</p>
													<div className="flex flex-col sm:flex-row gap-2">
														<button
															onClick={() =>
																handleEditQuestion(
																	questions[0],
																)
															}
															className="btn-primary"
															style={{
																backgroundColor:
																	"var(--color-primary)",
															}}
														>
															Edit Pertanyaan
														</button>
														<button
															onClick={() =>
																handleDeleteQuestion(
																	questions[0]
																		.id,
																)
															}
															className="btn-danger"
														>
															Hapus Pertanyaan
														</button>
													</div>
												</div>
											) : (
												<button
													onClick={() =>
														handleCreateQuestion(
															pageNum,
														)
													}
													className="btn-primary"
												>
													Buat Pertanyaan
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Page Image Modal */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
					onClick={closeModal}
				>
					<div
						className="bg-white rounded-xl p-4 overflow-auto relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 text-4xl text-gray-400 hover:text-gray-900 transition-colors"
						>
							×
						</button>
						<h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
							Halaman {selectedPage}
						</h2>
						{pageImageUrl ? (
							<img
								src={pageImageUrl}
								alt={`Page ${selectedPage}`}
								className="mx-auto max-h-[80vh] w-auto"
							/>
						) : (
							<p className="text-red-500 text-center py-12">
								Gagal memuat gambar halaman
							</p>
						)}
					</div>
				</div>
			)}

			{/* Question Modal */}
			{showQuestionModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
					<div
						className="fixed inset-0 bg-black/60"
						onClick={closeQuestionModal}
					/>
					<div className="relative bg-gray-50 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
						<div className="p-8">
							<h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
								{modalMode === "create"
									? "Tambah Pertanyaan"
									: "Edit Pertanyaan"}
							</h3>
							<textarea
								value={questionFormData.question}
								onChange={(e) =>
									setQuestionFormData({
										question: e.target.value,
									})
								}
								style={{ resize: "none" }}
								className="w-full text-gray-800 h-44 border border-gray-300 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y text-base"
								placeholder="Tulis pertanyaan Anda di sini..."
							/>
						</div>
						<div className="bg-gray-50 px-8 py-6 flex gap-3 justify-end">
							<button
								onClick={closeQuestionModal}
								className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
							>
								Batal
							</button>
							<button
								onClick={handleSubmitQuestion}
								disabled={
									creatingQuestion ||
									!questionFormData.question.trim()
								}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
								style={{
									backgroundColor: "var(--color-primary)",
								}}
							>
								{creatingQuestion
									? "Menyimpan..."
									: modalMode === "create"
										? "Tambahkan"
										: "Update"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Loading Overlay */}
			{loadingPage && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
					<div className="bg-white px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
						<div
							className="animate-spin rounded-full h-8 w-8 border-b-2"
							style={{
								borderBottomColor: "var(--color-primary)",
							}}
						/>
						<p className="text-base sm:text-lg text-gray-700">
							Memuat halaman...
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default VerticalStepper;
