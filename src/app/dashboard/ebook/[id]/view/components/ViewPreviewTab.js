"use client";

import styles from "../../../new/new.module.css";

export default function ViewPreviewTab({
	isActive,
	contentId,
	previewWorkerStatus,
	showPreviewLoader,
}) {
	return (
		<div
			className={`${styles.tabContent} ${isActive ? styles.active : ""}`}
		>
			<div className={styles.section}>
				<h2>Preview</h2>

				{/* Show processing indicator when preview is being created */}
				{showPreviewLoader && (
					<div className={styles.loadingContainer}>
						<div className={styles.spinner}></div>
						<p>Creating preview...</p>
						<span className={styles.statusBadge}>
							{previewWorkerStatus}
						</span>
					</div>
				)}

				{!showPreviewLoader && (
					<a
						href={`/dashboard/ebook/${contentId}/preview`}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.previewBtn}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Open Preview
					</a>
				)}
			</div>
		</div>
	);
}
