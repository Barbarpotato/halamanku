"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/components/ModalProvider";

export default function QuestionsTab({ content }) {
	const modal = useModal();
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
	const [editingQuestion, setEditingQuestion] = useState(null);
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({ pageNumber: "", question: "" });
	const [errorMessage, setErrorMessage] = useState("");
	const [fetchError, setFetchError] = useState(null);

	const fetchQuestions = async () => {
		setLoading(true);
		setFetchError(null);
		try {
			const res = await fetch(
				`/api/ebook-user-content-question?contentId=${content.id}`,
			);
			const data = await res.json();
			setQuestions(data.data || []);
		} catch (error) {
			setFetchError(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, [content.id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const action = modalMode === "edit" ? "update" : modalMode;
		const payload = {
			action,
			ebookUserContentId: content.id,
			pageNumber: parseInt(formData.pageNumber),
			question: formData.question,
		};

		try {
			const res = await fetch("/api/ebook-user-content-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				fetchQuestions();
				handleModalClose();
				setErrorMessage("");
			} else {
				const errorData = await res.json();
				setErrorMessage(errorData.error || "Error saving question");
				setTimeout(() => setErrorMessage(""), 5000);
			}
		} catch (error) {
			console.error("Failed to save question", error);
			setErrorMessage("Failed to save question");
			setTimeout(() => setErrorMessage(""), 5000);
		}
	};

	const handleAddQuestion = () => {
		setModalMode("create");
		setFormData({ pageNumber: "", question: "" });
		setShowModal(true);
	};

	const handleEdit = (q) => {
		setModalMode("edit");
		setEditingQuestion(q);
		setFormData({
			pageNumber: q.page_number.toString(),
			question: q.question,
		});
		setShowModal(true);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setEditingQuestion(null);
		setFormData({ pageNumber: "", question: "" });
	};

	const handleDelete = async (questionId) => {
		const confirmed = await modal.confirm({
			message: "Apakah Anda yakin ingin menghapus pertanyaan ini?",
		});
		if (!confirmed) return;

		try {
			const res = await fetch("/api/ebook-user-content-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "delete",
					questionId,
				}),
			});
			if (res.ok) {
				fetchQuestions();
				setErrorMessage("");
			} else {
				const errorData = await res.json();
				setErrorMessage(errorData.error || "Error deleting question");
				setTimeout(() => setErrorMessage(""), 5000);
			}
		} catch (error) {
			console.error("Failed to delete question", error);
			setErrorMessage("Failed to delete question");
			setTimeout(() => setErrorMessage(""), 5000);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-start">
				<div>
					<h2 className="section-title my-2">
						Pertanyaan untuk Pembaca
					</h2>
					<p className="text-gray-600">
						Tambahkan pertanyaan di halaman tertentu untuk memicu
						interaksi dengan pembaca.
					</p>
				</div>
				{!content.is_published && (
					<button
						onClick={handleAddQuestion}
						className="btn-primary ml-auto"
					>
						+
					</button>
				)}
			</div>

			{errorMessage && (
				<div className="error-message">
					<p>❌ {errorMessage}</p>
				</div>
			)}

			{fetchError && (
				<div className="error-card">
					<p>
						❌ Kesalahan memuat daftar pertanyaan:{" "}
						{fetchError.message}
					</p>
				</div>
			)}

			<div className="bg-white rounded-lg">
				<div className="py-4 border-b border-gray-200">
					<h4 className="text-lg font-medium text-gray-900">
						Daftar Pertanyaan
					</h4>
				</div>
				<div className="">
					{loading ? (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<span className="ml-2 text-gray-600">
								Memuat...
							</span>
						</div>
					) : questions.length === 0 ? (
						content.is_published ? (
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
											d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="mt-2 text-sm font-medium text-gray-900">
									Tidak Ada Pertanyaan
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Kamu tidak menyiapkan pertanyaan untuk
									konten ini.
								</p>
							</div>
						) : (
							<p className="text-gray-500 text-center py-8">
								Belum ada pertanyaan. Tambahkan pertanyaan
								pertama Anda!
							</p>
						)
					) : (
						<div className="space-y-4">
							{questions.map((q) => (
								<div
									key={q.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												Halaman {q.page_number}
											</span>
										</div>
										<p className="text-gray-900 font-medium">
											{q.question}
										</p>
									</div>
									<div className="mt-3 sm:mt-0 flex gap-2">
										{!content.is_published && (
											<button
												onClick={(e) => {
													e.preventDefault();
													handleEdit(q);
												}}
												className="btn-primary"
											>
												Edit
											</button>
										)}
										{!content.is_published && (
											<button
												onClick={(e) => {
													e.preventDefault();
													handleDelete(q.id);
												}}
												className="btn-danger"
											>
												Hapus
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
						<div
							className="fixed inset-0 transition-opacity"
							aria-hidden="true"
						>
							<div
								className="absolute inset-0 bg-gray-500 opacity-75"
								onClick={handleModalClose}
							></div>
						</div>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<h3 className="section-title mb-4">
											{modalMode === "create"
												? "Tambah Pertanyaan"
												: "Edit Pertanyaan"}
										</h3>

										<div className="space-y-4">
											<div className="field">
												<label className="field-label text-left">
													Nomor Halaman
												</label>
												<input
													type="number"
													value={formData.pageNumber}
													onChange={(e) =>
														setFormData({
															...formData,
															pageNumber:
																e.target.value,
														})
													}
													className="field-input"
													required
													disabled={
														modalMode === "edit"
													}
													placeholder="Masukkan nomor halaman"
												/>
											</div>
											<div className="field">
												<label className="field-label text-left">
													Pertanyaan
												</label>
												<textarea
													value={formData.question}
													onChange={(e) =>
														setFormData({
															...formData,
															question:
																e.target.value,
														})
													}
													className="field-input"
													required
													rows={4}
													placeholder="Tulis pertanyaan Anda di sini..."
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={(e) => {
										e.preventDefault();
										handleSubmit(e);
									}}
									disabled={
										loading ||
										!formData.pageNumber.trim() ||
										!formData.question.trim()
									}
									className="btn-primary sm:ml-3"
								>
									{loading
										? "Menyimpan..."
										: modalMode === "create"
											? "Tambah"
											: "Update"}
								</button>
								<button
									onClick={handleModalClose}
									className="btn-secondary sm:mt-0 sm:ml-3"
								>
									Batal
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
