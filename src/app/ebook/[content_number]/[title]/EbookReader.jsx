"use client";

import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./test.module.css";
import Link from "next/link";

const PAGE_BUFFER = 25;
const JUMP_PRELOAD_RANGE = 2;
const SLIDER_DEBOUNCE = 250;

const generateSkeleton = () => {
	const paragraphs = Math.floor(Math.random() * 3) + 4;

	return Array.from({ length: paragraphs }).map((_, pIndex) => {
		const lines = Math.floor(Math.random() * 4) + 3;

		return (
			<div key={pIndex} className="flex flex-col gap-2 mt-4">
				{Array.from({ length: lines }).map((_, lIndex) => {
					const width =
						lIndex === lines - 1
							? `${40 + Math.random() * 40}%`
							: `${80 + Math.random() * 20}%`;

					return (
						<div
							key={lIndex}
							className="h-3 bg-gray-300 rounded"
							style={{ width }}
						/>
					);
				})}
			</div>
		);
	});
};

export default function FlipBookReader({ contentNumber, totalPages }) {
	const [pages, setPages] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [inputPage, setInputPage] = useState(1);

	const tokenRef = useRef(null);
	const loadingSet = useRef(new Set());
	const cacheRef = useRef({});
	const bookRef = useRef(null);
	const debounceRef = useRef(null);

	const router = useRouter();

	const [size, setSize] = useState({ width: 600, height: 800 });
	useEffect(() => {
		const updateSize = () => {
			const screenWidth = window.innerWidth;

			if (screenWidth < 480) {
				// mobile
				const width = screenWidth; // padding
				setSize({
					width,
					height: width * (4 / 3), // keep ratio
				});
			} else if (screenWidth < 768) {
				// tablet
				const width = screenWidth - 80;
				setSize({
					width,
					height: width * (4 / 3),
				});
			} else {
				// desktop
				setSize({ width: 600, height: 800 });
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		return () => window.removeEventListener("resize", updateSize);
	}, []);

	useEffect(() => {
		const init = async () => {
			const supabase = createClient();

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push(`/login`);
				return;
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				router.push(`/login`);
				return;
			}

			tokenRef.current = session.access_token;

			await Promise.all([loadPage(0, 0), loadPage(1, 0), loadPage(2, 0)]);

			setLoading(false);
		};

		init();

		return () => {
			Object.values(cacheRef.current).forEach((url) =>
				URL.revokeObjectURL(url),
			);
		};
	}, []);

	const loadPage = async (index, current) => {
		if (index < 0 || index >= totalPages) return;
		if (pages[index]) return;
		if (loadingSet.current.has(index)) return;

		loadingSet.current.add(index);

		try {
			const res = await fetch(
				`/api/ebook-page?contentNumber=${contentNumber}&page=${index + 1}`,
				{
					headers: {
						Authorization: `Bearer ${tokenRef.current}`,
					},
				},
			);

			if (!res.ok) return;

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);

			cacheRef.current[index] = url;

			setPages((prev) => {
				const updated = { ...prev, [index]: true };

				Object.keys(updated).forEach((key) => {
					const k = Number(key);

					if (Math.abs(k - current) > PAGE_BUFFER) {
						delete updated[k];

						if (cacheRef.current[k]) {
							URL.revokeObjectURL(cacheRef.current[k]);
							delete cacheRef.current[k];
						}
					}
				});

				return updated;
			});
		} catch (err) {
			console.error(err);
		} finally {
			loadingSet.current.delete(index);
		}
	};

	const onFlip = (e) => {
		const current = e.data;

		setCurrentPage(current);
		setInputPage(current + 1);

		loadPage(current, current);
		loadPage(current + 1, current);
		loadPage(current - 1, current);
	};

	const handleJump = async (pageIndex) => {
		if (pageIndex < 0 || pageIndex >= totalPages) return;

		setCurrentPage(pageIndex);
		setInputPage(pageIndex + 1);

		for (
			let i = pageIndex - JUMP_PRELOAD_RANGE;
			i <= pageIndex + JUMP_PRELOAD_RANGE;
			i++
		) {
			loadPage(i, pageIndex);
		}

		bookRef.current?.pageFlip().flip(pageIndex);
	};

	const handleSliderChange = (value) => {
		setCurrentPage(value);
		setInputPage(value + 1);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			handleJump(value);
		}, SLIDER_DEBOUNCE);
	};

	const goNext = () => bookRef.current?.pageFlip().flipNext();
	const goPrev = () => bookRef.current?.pageFlip().flipPrev();

	return (
		<div className={styles.container}>
			{/* 🔥 GLOBAL LOADING OVERLAY */}
			{loading && (
				<div className={styles.globalLoader}>
					<div className={styles.spinner}></div>
					<p className={styles.loadingText}>Preparing your book...</p>
				</div>
			)}

			{/* BRAND */}
			<Link href="/">
				<div className={styles.brand}>
					<div className={styles.logoPlaceholder}>
						<img src="/halamanku.png" alt="Halamanku" />
					</div>
					<span>
						Dibuat dengan <b>Halamanku</b>
					</span>
				</div>
			</Link>

			<div className={styles.bookWrapper}>
				<HTMLFlipBook
					ref={bookRef}
					width={size.width}
					height={size.height}
					flippingTime={900}
					drawShadow={true}
					useMouseEvents={true}
					className={styles.flipBook}
					onFlip={onFlip}
					showCover={true}
					mobileScrollSupport={true}
				>
					{Array.from({ length: totalPages }).map((_, i) => (
						<div key={i} className={styles.page}>
							{pages[i] ? (
								<img
									src={cacheRef.current[i]}
									className={styles.canvas}
									draggable={false}
								/>
							) : (
								<div className="w-full h-full bg-[#fdfcf7] p-8 animate-pulse flex flex-col">
									{generateSkeleton()}
								</div>
							)}
						</div>
					))}
				</HTMLFlipBook>

				<button
					onClick={goPrev}
					className={`${styles.navButton} ${styles.left}`}
				>
					‹
				</button>

				<button
					onClick={goNext}
					className={`${styles.navButton} ${styles.right}`}
				>
					›
				</button>
			</div>

			<div className={styles.footer}>
				<div className={styles.controls}>
					<input
						type="range"
						min={0}
						max={totalPages - 1}
						value={currentPage}
						onChange={(e) =>
							handleSliderChange(Number(e.target.value))
						}
						className={styles.slider}
					/>

					<div className={styles.pageInputWrapper}>
						<input
							type="number"
							min={1}
							max={totalPages}
							value={inputPage}
							onChange={(e) => {
								const val = Number(e.target.value);
								setInputPage(val);
							}}
							onBlur={() => handleJump(inputPage - 1)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleJump(inputPage - 1);
								}
							}}
							className={styles.pageInput}
						/>
						<span> /</span>
						<span> {totalPages}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
