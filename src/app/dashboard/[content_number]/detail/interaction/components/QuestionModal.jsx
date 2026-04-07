"use client";

const QuestionModal = ({
	showQuestionModal,
	closeQuestionModal,
	questionFormData,
	setQuestionFormData,
	creatingQuestion,
	handleSubmitQuestion,
	modalMode,
}) => {
	return (
		showQuestionModal && (
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
		)
	);
};

export default QuestionModal;
