"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Chrono } from "react-chrono";
import { createClient } from "@/lib/supabase/client";

const VerticalStepper = ({ totalPages }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPage, setSelectedPage] = useState(null);
	const [pageImageUrl, setPageImageUrl] = useState(null);
	const [loadingImage, setLoadingImage] = useState(false);

	const tokenRef = useRef(null);
	const supabase = useMemo(() => createClient(), []);

	// ✅ build items
	const items = useMemo(
		() =>
			Array.from({ length: totalPages }, (_, i) => ({
				title: `Page ${i + 1}`,
			})),
		[totalPages],
	);

	// ✅ custom content per item (this is the key change)
	const contentDetailsChildren = useMemo(
		() =>
			Array.from({ length: totalPages }, (_, i) => (
				<div key={i} className="flex flex-col gap-2">
					<p className="text-sm text-gray-600">
						This is page {i + 1}
					</p>

					<button
						onClick={() => handleOpenPage(i + 1)}
						className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Open Page
					</button>
				</div>
			)),
		[totalPages],
	);

	// ✅ fetch token once
	useEffect(() => {
		const getToken = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				tokenRef.current = session.access_token;
			}
		};

		getToken();
	}, [supabase]);

	// ✅ explicit open handler (no chrono involvement)
	const handleOpenPage = async (pageNumber) => {
		setSelectedPage(pageNumber);
		setIsModalOpen(true);
		setLoadingImage(true);

		try {
			const contentNumber = "CNT-f0e21b701bf21318";

			const res = await fetch(
				`/api/ebook-page?contentNumber=${contentNumber}&page=${pageNumber}`,
				{
					headers: {
						Authorization: `Bearer ${tokenRef.current}`,
					},
				},
			);

			if (!res.ok) throw new Error("Failed fetch");

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setPageImageUrl(url);
		} catch (err) {
			console.error(err);
			setPageImageUrl(null);
		} finally {
			setLoadingImage(false);
		}
	};

	// cleanup URL
	useEffect(() => {
		return () => {
			if (pageImageUrl) {
				URL.revokeObjectURL(pageImageUrl);
			}
		};
	}, [pageImageUrl]);

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedPage(null);
		setPageImageUrl(null);
	};

	return (
		<div className="w-full">
			<Chrono
				animation={{
					slideshow: {
						enabled: true,
						duration: 3000,
						type: "fade",
					},
				}}
				interaction={{
					keyboardNavigation: true,
				}}
				items={items}
				display={{
					borderless: true,
					toolbar: { enabled: true, sticky: true },
				}}
				mode="VERTICAL_ALTERNATING"
			>
				{contentDetailsChildren}
			</Chrono>

			{/* MODAL */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={closeModal}
				>
					<div
						className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={closeModal}
							className="absolute top-2 right-2 text-2xl"
						>
							×
						</button>

						<h2 className="text-xl font-bold mb-4">
							Page {selectedPage}
						</h2>

						{loadingImage ? (
							<p>Loading...</p>
						) : pageImageUrl ? (
							<img
								src={pageImageUrl}
								className="max-h-[70vh] object-contain"
							/>
						) : (
							<p className="text-red-500">Failed to load image</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default VerticalStepper;
