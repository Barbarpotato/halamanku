import { useState } from "react";

export function useQuestionModal(contentId, tokenRef, onQuestionsUpdate) {
	const [showQuestionModal, setShowQuestionModal] = useState(false);
	const [questionFormData, setQuestionFormData] = useState({ question: "" });
	const [creatingQuestion, setCreatingQuestion] = useState(false);
	const [currentQuestionPage, setCurrentQuestionPage] = useState(null);
	const [modalMode, setModalMode] = useState('create');
	const [editingQuestion, setEditingQuestion] = useState(null);

	const handleCreateQuestion = (pageNumber) => {
		setModalMode('create');
		setEditingQuestion(null);
		setCurrentQuestionPage(pageNumber);
		setQuestionFormData({ question: "" });
		setShowQuestionModal(true);
	};

	const handleSubmitQuestion = async (e) => {
		e.preventDefault();
		if (!questionFormData.question.trim()) return;

		setCreatingQuestion(true);

		const action = modalMode === 'edit' ? 'update' : 'create';
		const payload = {
			action,
			ebookUserContentId: contentId,
			pageNumber: currentQuestionPage,
			question: questionFormData.question,
		};

		if (modalMode === 'edit') {
			payload.questionId = editingQuestion.id;
		}

		try {
			const res = await fetch('/api/ebook-user-content-question', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${tokenRef.current}`,
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error(`Failed to ${action} question`);

			const questionsRes = await fetch(`/api/ebook-user-content-question?contentId=${contentId}`, {
				headers: { Authorization: `Bearer ${tokenRef.current}` },
			});
			const questionsData = await questionsRes.json();
			onQuestionsUpdate(questionsData.data || []);

			setShowQuestionModal(false);
			setQuestionFormData({ question: "" });
			setCurrentQuestionPage(null);
			setModalMode('create');
			setEditingQuestion(null);
		} catch (error) {
			console.error(`Failed to ${action} question:`, error);
			alert(`Failed to ${action} question`);
		} finally {
			setCreatingQuestion(false);
		}
	};

	const handleEditQuestion = (question) => {
		setModalMode('edit');
		setEditingQuestion(question);
		setCurrentQuestionPage(question.page_number);
		setQuestionFormData({ question: question.question });
		setShowQuestionModal(true);
	};

	const handleDeleteQuestion = async (questionId) => {
		const confirmed = window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?');
		if (!confirmed) return;

		try {
			const res = await fetch('/api/ebook-user-content-question', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${tokenRef.current}`,
				},
				body: JSON.stringify({
					action: 'delete',
					questionId,
				}),
			});

			if (!res.ok) throw new Error('Failed to delete question');

			const questionsRes = await fetch(`/api/ebook-user-content-question?contentId=${contentId}`, {
				headers: { Authorization: `Bearer ${tokenRef.current}` },
			});
			const questionsData = await questionsRes.json();
			onQuestionsUpdate(questionsData.data || []);
		} catch (error) {
			console.error('Failed to delete question:', error);
			alert('Failed to delete question');
		}
	};

	const closeQuestionModal = () => {
		setShowQuestionModal(false);
		setQuestionFormData({ question: "" });
		setCurrentQuestionPage(null);
		setModalMode('create');
		setEditingQuestion(null);
	};

	return {
		showQuestionModal,
		questionFormData,
		setQuestionFormData,
		creatingQuestion,
		modalMode,
		handleCreateQuestion,
		handleSubmitQuestion,
		handleEditQuestion,
		handleDeleteQuestion,
		closeQuestionModal,
	};
}