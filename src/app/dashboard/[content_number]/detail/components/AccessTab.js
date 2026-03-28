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
			setSuccessMessage("Access granted successfully!");
			setErrorMessage("");
			setTimeout(() => setSuccessMessage(""), 5000);
		},
		onError: (error) => {
			setErrorMessage(`Failed to grant access: ${error.message}`);
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
			setSuccessMessage("Access removed successfully!");
			setErrorMessage("");
			setTimeout(() => setSuccessMessage(""), 5000);
		},
		onError: (error) => {
			setErrorMessage(`Failed to remove access: ${error.message}`);
			setSuccessMessage("");
			setTimeout(() => setErrorMessage(""), 5000);
		},
	});

	const handleAddEmail = () => {
		if (newEmail.trim()) {
			createMutation.mutate(newEmail.trim());
		}
	};

	const handleDelete = async (id) => {
		const result = await modal.confirm({
			message: "Are you sure you want to remove this access?",
		});
		if (result) {
			deleteMutation.mutate(id);
		}
	};

	const handleFilterChange = (e) => {
		setEmailFilter(e.target.value);
		setPage(1);
	};

	// Calculate totalPages safely
	const totalPages = data
		? Math.max(1, Math.ceil(data.total / data.limit))
		: 1;

	return (
		<div className="access-management">
			<div className="section-header">
				<h2 className="section-title">Access Management</h2>
				<p className="section-description">
					Manage email addresses that have access to this content
				</p>
			</div>
			<hr className="section-divider"></hr>

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

			<div className="add-access-card mt-4">
				<h3>Add New Access</h3>
				<div className="add-access-form">
					<div className="form-row">
						<input
							type="email"
							placeholder="Enter email address (e.g., user@example.com)"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							className="field-input"
						/>
						<button
							type="button"
							onClick={handleAddEmail}
							disabled={createMutation.isPending}
							className="btn-primary"
						>
							{createMutation.isPending
								? "Adding..."
								: "Grant Access"}
						</button>
					</div>
				</div>
			</div>

			<div className="filters-section">
				<h2 className="section-title">User Access List</h2>

				<div className="search-box">
					<input
						type="text"
						placeholder="Search User by email address..."
						value={emailFilter}
						onChange={handleFilterChange}
						className="field-input"
					/>
					<span className="search-icon">🔍</span>
				</div>
			</div>

			{isLoading && (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading access list...</p>
				</div>
			)}

			{error && (
				<div className="error-card">
					<p>❌ Error loading access list: {error.message}</p>
				</div>
			)}

			{data && data.data.length === 0 && !isLoading && (
				<div className="empty-state">
					<div className="empty-icon">📧</div>
					<h3>No Access Records</h3>
					<p>
						{emailFilter
							? "No emails match your search criteria."
							: "No one has been granted access to this content yet."}
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
											Lynk ID:{" "}
											{access.lynk_id_reference_id}
										</div>
									)}
									<div className="created-date">
										Granted on{" "}
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
										onClick={() => handleDelete(access.id)}
										disabled={deleteMutation.isPending}
										className="btn-danger-outline btn-sm"
										title="Remove access"
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="pagination-controls">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="btn-secondary pagination-btn"
						>
							← Previous
						</button>
						<span className="pagination-info">
							Page {page} of {totalPages}
						</span>
						<button
							onClick={() =>
								setPage((p) => Math.min(totalPages, p + 1))
							}
							disabled={page >= totalPages}
							className="btn-secondary pagination-btn"
						>
							Next →
						</button>
					</div>
				</>
			)}
		</div>
	);
}
