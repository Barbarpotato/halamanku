"use client";

import { useState, useEffect } from "react";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";

export default function MerchantKeyInput({ onKeySaved, currentKey }) {
	const [merchantKey, setMerchantKey] = useState(currentKey || "");
	const [showKey, setShowKey] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		setMerchantKey(currentKey || "");
	}, [currentKey]);

	const handleSave = async () => {
		if (!merchantKey.trim()) return;

		setIsSaving(true);
		try {
			const response = await fetch("/api/settings/merchant-key", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ merchantKey }),
			});

			if (response.ok) {
				setShowModal(true);
			} else {
				alert("Gagal menyimpan merchant key");
			}
		} catch (error) {
			alert("Terjadi kesalahan");
		} finally {
			setIsSaving(false);
		}
	};

	const handleModalClose = () => {
		setShowModal(false);
		onKeySaved();
	};

	return (
		<>
			<div>
				<h3 className="text-lg font-semibold mb-4 text-gray-800">
					Merchant Key LYNK
				</h3>
				<p className="text-sm text-gray-600 mb-4">
					Masukkan merchant key dari LYNK untuk mengaktifkan integrasi
					webhook.
				</p>
				<div className="flex gap-2">
					<div className="relative flex-1">
						<input
							type={showKey ? "text" : "password"}
							value={merchantKey}
							onChange={(e) => setMerchantKey(e.target.value)}
							placeholder="Masukkan merchant key"
							className="w-full p-2 border rounded pr-10 text-black"
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
						>
							{showKey ? (
								<MdVisibilityOff size={20} />
							) : (
								<MdVisibility size={20} />
							)}
						</button>
					</div>
					<button
						onClick={handleSave}
						disabled={isSaving || !merchantKey.trim()}
						className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
					>
						{isSaving
							? "Menyimpan..."
							: currentKey
								? "Ubah"
								: "Simpan"}
					</button>
				</div>
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold mb-4 text-gray-800">
							Berhasil!
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Merchant key Anda berhasil disimpan. Merchant key
							ini disimpan dengan kebijakan dan privasi yang telah
							diterima sebelumnya. Anda bisa menggunakan webhook
							url berikut untuk integrasi dengan platform LYNK
						</p>
						<div className="flex justify-end">
							<button
								onClick={handleModalClose}
								className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
							>
								OK, saya mengerti
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
