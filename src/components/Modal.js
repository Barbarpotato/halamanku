"use client";

import React from "react";

const Modal = ({ isOpen, type, message, onConfirm, onCancel, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<p className="text-sm sm:text-base">{message}</p>
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
