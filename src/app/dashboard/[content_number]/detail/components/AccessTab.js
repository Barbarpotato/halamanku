"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/components/ModalProvider";
import { getEbookUserContentAccessList } from "@/services/userContentAccess/get";
import { createEbookUserContentAccess } from "@/services/userContentAccess/create";
import { deleteEbookUserContentAccess } from "@/services/userContentAccess/delete";

export default function AccessTab({ content, readOnly = false }) {
	const queryClient = useQueryClient();
	const modal = useModal();
	const [emailFilter, setEmailFilter] = useState("");
	const [page, setPage] = useState(1);
	const [newEmail, setNewEmail] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [emailError, setEmailError] = useState("");

	const { data, isLoading, error } = useQuery({
		queryKey: [
			"accessList",
			content.ebook_user_content_number,
			emailFilter,
			page,
		],
		queryFn: () =>
			getEbookUserContentAccessList(
				content.ebook_user_content_number,
				emailFilter,
				page,
				10,
			),
	});

	const createMutation = useMutation({
		mutationFn: (email) =>
			createEbookUserContentAccess(
				content.ebook_user_content_number,
				email,
				content.id,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["accessList", content.ebook_user_content_number],
			});
			setNewEmail("");
			setEmailError("");
			setSuccessMessage("Akses diberikan dengan sukses!");
			setErrorMessage("");
			setTimeout(() => setSuccessMessage(""), 5000);
		},
		onError: (error) => {
			setErrorMessage(`Gagal memberikan akses: ${error.message}`);
			setSuccessMessage("");
			setTimeout(() => setErrorMessage(""), 5000);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteEbookUserContentAccess,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["accessList", content.ebook_user_content_number],
			});
			setSuccessMessage("Akses dihapus dengan sukses!");
			setErrorMessage("");
			setTimeout(() => setSuccessMessage(""), 5000);
		},
		onError: (error) => {
			setErrorMessage(`Gagal menghapus akses: ${error.message}`);
			setSuccessMessage("");
			setTimeout(() => setErrorMessage(""), 5000);
		},
	});

	const handleAddEmail = () => {
		if (newEmail.trim() && !emailError) {
			createMutation.mutate(newEmail.trim());
		}
	};

	const handleDelete = async (id) => {
		const result = await modal.confirm({
			message: "Apakah Anda yakin ingin menghapus akses ini?",
		});
		if (result) {
			deleteMutation.mutate(id);
		}
	};

	const handleFilterChange = (e) => {
		setEmailFilter(e.target.value);
		setPage(1);
	};

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (e) => {
		const value = e.target.value;
		setNewEmail(value);

		if (value.trim() === "") {
			setEmailError("");
		} else if (!validateEmail(value)) {
			setEmailError("Format email tidak valid");
		} else {
			setEmailError("");
		}
	};

	// Calculate totalPages safely
	const totalPages = data
		? Math.max(1, Math.ceil(data.total / data.limit))
		: 1;

	return (
		<div className="access-management">
			<div className="section-header">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="section-title">Manajemen Akses</h2>
						<p className="section-description">
							Kelola alamat email yang memiliki akses ke konten ini
						</p>
					</div>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setShowAddModal(true);
						}}
						className="btn-primary flex items-center gap-2"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
			</div>
			<hr className="section-divider my-2"></hr>

			{successMessage && (
				<div className="success-message">
					<p>✅ {successMessage}</p>
				</div>
			)}

			{errorMessage && (
				<div className="error-message">
					<p>❌ {errorMessage}</p>
				</div>
			)}


			<div className="filters-section">
				<div className="flex items-center justify-between">
					<h2 className="section-title">Daftar Akses Pengguna</h2>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setShowSearchModal(true);
						}}
						className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
						title="Cari pengguna"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="11" cy="11" r="8" />
							<path d="M21 21l-4.35-4.35" />
						</svg>
					</button>
				</div>
				{emailFilter && (
					<p className="text-sm text-gray-600 mt-1">
						Anda sedang mencari: <span className="font-medium">{emailFilter}</span>
					</p>
				)}
			</div>

			{isLoading && (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Memuat daftar akses...</p>
				</div>
			)}

			{error && (
				<div className="error-card">
					<p>❌ Kesalahan memuat daftar akses: {error.message}</p>
				</div>
			)}

			{data && data.data.length === 0 && !isLoading && (
				<div className="empty-state">
					<div className="empty-icon">📧</div>
					<h3>Tidak Ada Rekaman Akses</h3>
					<p>
						{emailFilter
							? "Tidak ada email yang cocok dengan kriteria pencarian Anda."
							: "Belum ada yang diberikan akses ke konten ini."}
					</p>
				</div>
			)}

			{data && data.data.length > 0 && (
				<>
					<div className="access-list">
						{data.data.map((access) => (
							<div key={access.id} className="access-item">
								<div className="access-info">
									<div className="email">
										{access.email_address}
									</div>
									{access.lynk_id_reference_id && (
										<div className="created-date">
											ID Lynk:{" "}
											{access.lynk_id_reference_id}
										</div>
									)}
									<div className="created-date">
										Diberikan pada{" "}
										{new Date(
											access.created,
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</div>
								</div>
								<div className="access-actions">
									<button
										onClick={(e) => {
											e.preventDefault();
											handleDelete(access.id)
										}}
										disabled={deleteMutation.isPending}
										className="btn-danger-outline btn-sm"
										title="Hapus akses"
									>
										Hapus
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="pagination-controls">
						<button
							onClick={(e) => {
								e.preventDefault();
								setPage((p) => Math.max(1, p - 1));
							}}
							disabled={page === 1}
							className="btn-secondary pagination-btn text-xs sm:text-sm md:text-base"
						>
							←
						</button>
						<span className="pagination-info text-xs sm:text-sm md:text-base">
							Hal {page} dari {totalPages}
						</span>
						<button
							onClick={(e) => {
								e.preventDefault();
								setPage((p) => Math.min(totalPages, p + 1));
							}}
							disabled={page >= totalPages}
							className="btn-secondary pagination-btn text-xs sm:text-sm md:text-base"
						>
							→
						</button>
					</div>
				</>
			)}

			{/* Add Access Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Tambah Akses Baru</h3>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									setShowAddModal(false);
									setNewEmail("");
									setEmailError("");
								}}
								className="text-gray-500 hover:text-gray-700 text-xl"
							>
								✕
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Alamat Email
								</label>
								<input
									type="email"
									placeholder="Masukkan alamat email"
									value={newEmail}
									onChange={handleEmailChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
								/>
								{emailError && (
									<p className="text-red-600 text-sm mt-1">{emailError}</p>
								)}
							</div>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setShowAddModal(false);
									}}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										handleAddEmail();
										setShowAddModal(false);
									}}
									disabled={createMutation.isPending || !newEmail.trim() || emailError}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
								>
									{createMutation.isPending ? "Menambahkan..." : "Berikan Akses"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Search Modal */}
			{showSearchModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Cari Pengguna</h3>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									setShowSearchModal(false);
								}}
								className="text-gray-500 hover:text-gray-700 text-xl"
							>
								✕
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Alamat Email
								</label>
								<div className="relative">
									<input
										type="text"
										placeholder="Cari Alamat Email"
										value={emailFilter}
										onChange={handleFilterChange}
										className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
									/>
									<svg
										className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<circle cx="11" cy="11" r="8" />
										<path d="M21 21l-4.35-4.35" />
									</svg>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setEmailFilter("");
										setPage(1);
									}}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
								>
									Reset
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setShowSearchModal(false);
									}}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Lanjut
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
