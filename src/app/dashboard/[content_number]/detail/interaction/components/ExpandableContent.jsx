"use client";

import React from "react";
import {
	FaRegLightbulb,
	FaHeart,
	FaThumbsUp,
	FaEye,
	FaQuestion,
	FaThumbsDown,
} from "react-icons/fa";
import { useModal } from "@/components/modal/ModalProvider";

const ExpandableContent = ({
	pageNum,
	hasQuestion,
	questions,
	content,
	emotionCounts,
	handleEditQuestion,
	handleDeleteQuestion,
	handleCreateQuestion,
}) => {
	const modal = useModal();

	return (
		<div className="px-4 sm:px-7 pb-8 border-t border-gray-100">
			{/* Emotion Counters */}
			<div className="font-semibold text-gray-900 mt-4">Ringkasan</div>
			<div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-6 border-b">
				{[
					{
						icon: FaThumbsUp,
						count: emotionCounts.like,
						color: "text-green-500",
						label: "Suka",
					},
					{
						icon: FaHeart,
						count: emotionCounts.love,
						color: "text-red-500",
						label: "Cinta",
					},
					{
						icon: FaRegLightbulb,
						count: emotionCounts.thinking,
						color: "text-yellow-500",
						label: "Berpikir",
					},
					{
						icon: FaEye,
						count: emotionCounts.seen,
						color: "text-gray-500",
						label: "Dilihat",
					},
					{
						icon: FaQuestion,
						count: emotionCounts.confused,
						color: "text-purple-500",
						label: "Bingung",
					},
					{
						icon: FaThumbsDown,
						count: emotionCounts.dislike,
						color: "",
						label: "Tidak Suka",
						style: {
							color: "var(--color-primary)",
						},
					},
				].map((item, idx) => (
					<div key={idx} className="text-center">
						<item.icon
							className={`${item.color} text-2xl mx-auto mb-1 cursor-pointer`}
							style={item.style}
							title={`Anda memiliki ${item.count} tanggapan ${item.label} dari pembaca`}
							onClick={() =>
								modal.show({
									message: `Anda memiliki ${item.count} tanggapan ${item.label} dari pembaca`,
								})
							}
						/>
						<div className="font-bold text-gray-900 text-lg">
							{item.count}
						</div>
					</div>
				))}
			</div>

			{/* Questions Section */}
			<div className="pt-6">
				<div className="font-semibold text-gray-900 mb-4">
					Pertanyaan
				</div>
				{hasQuestion ? (
					<div className="bg-gray-50 p-4 rounded-xl">
						<p className="text-sm text-gray-800">
							{questions[0].question}
						</p>
					</div>
				) : (
					<div className="bg-gray-50 p-4 rounded-xl text-center">
						<FaQuestion
							size={40}
							className="mx-auto text-gray-400 mb-2"
						/>
						<p className="text-sm text-gray-600">
							Halaman ini tidak memiliki pertanyaan
						</p>
					</div>
				)}
			</div>

			{/* Action Section */}
			<div className="pt-6">
				<div className="font-semibold text-gray-900 mb-4">Aksi</div>

				{content.is_published ? (
					<button className="btn-primary">
						Lihat interaksi pembaca
					</button>
				) : hasQuestion ? (
					<div className="flex flex-col sm:flex-row gap-2">
						<button
							onClick={() => handleEditQuestion(questions[0])}
							className="btn-primary"
							style={{
								backgroundColor: "var(--color-primary)",
							}}
						>
							Ubah Pertanyaan
						</button>
						<button
							onClick={() =>
								handleDeleteQuestion(questions[0].id)
							}
							className="btn-danger"
						>
							Hapus Pertanyaan
						</button>
					</div>
				) : (
					<button
						onClick={() => handleCreateQuestion(pageNum)}
						className="btn-primary"
					>
						Buat Pertanyaan
					</button>
				)}
			</div>
		</div>
	);
};

export default ExpandableContent;
