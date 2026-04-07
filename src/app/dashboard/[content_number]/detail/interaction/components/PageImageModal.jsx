"use client";

const PageImageModal = ({
	isModalOpen,
	closeModal,
	selectedPage,
	pageImageUrl,
}) => {
	return (
		isModalOpen && (
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
		)
	);
};

export default PageImageModal;
