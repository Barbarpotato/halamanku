"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/modal/ModalProvider";
import {
	FaRegFileAlt,
	FaQuestion,
	FaChevronDown,
	FaChevronUp,
	FaClock,
} from "react-icons/fa";
import { RiChat3Line } from "react-icons/ri";
import Toolbar from "./Toolbar";
import QuestionModal from "./QuestionModal";
import PageImageModal from "./PageImageModal";
import ExpandableContent from "./ExpandableContent";

const VerticalStepper = ({
	totalPages,
	contentNumber,
	content,
	reactions: initialReactions,
	questions: initialQuestions,
}) => {
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

	const [reactions, setReactions] = useState(initialReactions || []);
	const [questions, setQuestions] = useState(initialQuestions || []);
	const [loadingData, setLoadingData] = useState(false);
	const [expandedPages, setExpandedPages] = useState(new Set([1]));
	const [jumpToPage, setJumpToPage] = useState("");

	const tokenRef = useRef(null);
	const supabase = useMemo(() => createClient(), []);

	// Sync state with props
	useEffect(() => {
		setReactions(initialReactions || []);
	}, [initialReactions]);

	useEffect(() => {
		setQuestions(initialQuestions || []);
	}, [initialQuestions]);

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
			}
		};
		getToken();
	}, [supabase]);

	// Refresh data after mutation
	const refreshData = () => {
		router.refresh();
	};

	const togglePage = (pageNum) => {
		setExpandedPages(new Set([pageNum]));
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
			ebookUserContentId: content.id,
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
		const pendingResponseCount = data.reactions.filter(
			(r) => r.author_response == null,
		).length;

		const emotionCounts = {
			like: data.reactions.filter((r) => r.emotion_type === "LIKE")
				.length,
			love: data.reactions.filter((r) => r.emotion_type === "LOVE")
				.length,
			thinking: data.reactions.filter(
				(r) => r.emotion_type === "THINKING",
			).length,
			seen: data.reactions.filter((r) => r.emotion_type === "SEEN")
				.length,
			dislike: data.reactions.filter((r) => r.emotion_type === "DISLIKE")
				.length,
			confused: data.reactions.filter(
				(r) => r.emotion_type === "CONFUSED",
			).length,
		};

		return {
			answerCount,
			thoughtCount,
			pendingResponseCount,
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
			<Toolbar
				totalPages={totalPages}
				jumpToPage={jumpToPage}
				setJumpToPage={setJumpToPage}
				jumpTo={jumpTo}
			/>

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
						pendingResponseCount,
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
										<div className="flex items-center gap-3">
											<span
												className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full cursor-pointer"
												title={`${thoughtCount + answerCount} Total interaksi dengan pembaca`}
												onClick={() =>
													modal.show({
														message: `${thoughtCount + answerCount} Total interaksi dengan pembaca`,
													})
												}
											>
												<RiChat3Line size={10} />
												{thoughtCount + answerCount}
											</span>
											<span
												className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-yellow-800 text-xs font-medium rounded-full cursor-pointer"
												title={`${pendingResponseCount} Menunggu tanggapan penulis`}
												onClick={() =>
													modal.show({
														message: `${pendingResponseCount} Menunggu tanggapan penulis`,
													})
												}
											>
												<FaClock size={10} />
												{pendingResponseCount}
											</span>
										</div>
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
										{questions.length > 0 && (
											<FaQuestion
												size={18}
												className="text-blue-500 cursor-pointer"
												title="Halaman ini memiliki pertanyaan kepada pembaca"
												onClick={(e) => {
													e.stopPropagation();
													modal.show({
														message:
															"Halaman ini memiliki pertanyaan kepada pembaca",
													});
												}}
											/>
										)}
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
									<ExpandableContent
										pageNum={pageNum}
										hasQuestion={hasQuestion}
										questions={questions}
										content={content}
										emotionCounts={emotionCounts}
										handleEditQuestion={handleEditQuestion}
										handleDeleteQuestion={
											handleDeleteQuestion
										}
										handleCreateQuestion={
											handleCreateQuestion
										}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<PageImageModal
				isModalOpen={isModalOpen}
				closeModal={closeModal}
				selectedPage={selectedPage}
				pageImageUrl={pageImageUrl}
			/>

			<QuestionModal
				showQuestionModal={showQuestionModal}
				closeQuestionModal={closeQuestionModal}
				questionFormData={questionFormData}
				setQuestionFormData={setQuestionFormData}
				creatingQuestion={creatingQuestion}
				handleSubmitQuestion={handleSubmitQuestion}
				modalMode={modalMode}
			/>

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
