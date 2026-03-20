"use client";

import React from "react";

const Modal = ({ isOpen, type, message, onConfirm, onCancel, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<p>{message}</p>
				<div className="modal-actions">
					{type === "confirm" ? (
						<>
							<button onClick={onCancel}>Cancel</button>
							<button onClick={onConfirm}>OK</button>
						</>
					) : (
						<button onClick={onConfirm}>OK</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal;
