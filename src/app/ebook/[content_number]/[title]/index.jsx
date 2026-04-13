"use client";

import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./ebook.module.css";
import Link from "next/link";
import ErrorPage from "@/components/body/ErrorPage";
import {
	MdLock,
	MdBuild,
	MdChat,
	MdShare,
	MdFullscreen,
	MdFullscreenExit,
} from "react-icons/md";

const PAGE_BUFFER = 25;
const JUMP_PRELOAD_RANGE = 2;
const SLIDER_DEBOUNCE = 250;

export default function FlipBookReader({ contentNumber, title, totalPages }) {
	const [pages, setPages] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [inputPage, setInputPage] = useState(1);
	const [accessDenied, setAccessDenied] = useState(false);

	const [showTools, setShowTools] = useState(false);
	const [isLandscape, setIsLandscape] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const tokenRef = useRef(null);
	const loadingSet = useRef(new Set());
	const cacheRef = useRef({});
	const bookRef = useRef(null);
	const debounceRef = useRef(null);

	const router = useRouter();

	const [size, setSize] = useState({ width: 600, height: 800 });

	useEffect(() => {
		const init = async () => {
			const supabase = createClient();

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push(
					`/login?next=${encodeURIComponent(`/ebook/${contentNumber}/${title}`)}`,
				);
				return;
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				router.push(
					`/login?next=${encodeURIComponent(`/ebook/${contentNumber}/${title}`)}`,
				);
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

			if (res.status === 401) {
				setAccessDenied(true);
				return;
			}

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

	useEffect(() => {
		const updateSize = () => {
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			if (screenWidth < 600) {
				// pure mobile
				setSize({ width: screenWidth, height: screenHeight * 0.8 });
				setIsMobile(true);
			} else {
				if (screenWidth / screenHeight < 1) {
					// For tablet
					setSize({
						width: screenWidth * 0.9,
						height: screenHeight * 0.8,
					});
					setIsMobile(true);
				} else {
					const totalBookWidth = Math.min(screenWidth * 0.9, 1300); // total width for both pages
					let pageWidth = Math.round(totalBookWidth / 2);
					let pageHeight = Math.round(pageWidth * (4 / 3)); // 3:4 ratio

					if (pageWidth < 500) {
						// landscape mobile orinetation
						setSize({
							width: screenWidth * 0.8,
							height: screenWidth,
						});
						setIsLandscape(true);
						setIsMobile(true);
					} else {
						// Don't make it too tall
						const maxHeight = Math.floor(screenHeight * 0.85);
						if (pageHeight > maxHeight) {
							pageHeight = maxHeight;
							pageWidth = Math.round(pageHeight * (3 / 4));
						}
						setSize({ width: pageWidth, height: pageHeight });
					}
				}
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		return () => window.removeEventListener("resize", updateSize);
	}, []);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange,
			);
	}, []);

	// Background preloading based on current page
	useEffect(() => {
		// Preload the next 2 pages ahead
		if (tokenRef.current) {
			loadPage(currentPage + 2, currentPage);
			loadPage(currentPage + 3, currentPage);
		}
	}, [currentPage]);

	const onFlip = (e) => {
		const current = e.data;

		setCurrentPage(current);
		setInputPage(current + 1);

		loadPage(current, current);
		loadPage(current + 1, current);
		loadPage(current - 1, current);
	};

	const handleJump = async (pageIndex) => {
		let clampedIndex = Math.max(
			0,
			Math.min(totalPages - 1, Math.floor(pageIndex)),
		);

		setCurrentPage(clampedIndex);
		setInputPage(clampedIndex + 1);

		for (
			let i = clampedIndex - JUMP_PRELOAD_RANGE;
			i <= clampedIndex + JUMP_PRELOAD_RANGE;
			i++
		) {
			loadPage(i, clampedIndex);
		}

		bookRef.current?.pageFlip().turnToPage(clampedIndex);
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

	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				// Enter fullscreen
				if (document.documentElement.requestFullscreen) {
					await document.documentElement.requestFullscreen();
				}
				// Fallback for older Safari / prefixed versions (rare now)
				else if (document.documentElement.webkitRequestFullscreen) {
					await document.documentElement.webkitRequestFullscreen();
				} else {
					alert("Fullscreen tidak didukung di browser ini.");
					return;
				}

				setIsFullscreen(true);
			} else {
				// Exit fullscreen
				if (document.exitFullscreen) {
					await document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					await document.webkitExitFullscreen();
				}

				setIsFullscreen(false);
			}
		} catch (err) {
			console.error("Fullscreen error:", err);
			// Optional: show user-friendly message
			// alert("Gagal masuk ke mode fullscreen. Coba gunakan tombol lain.");
		}
	};

	const controls = (
		<div className={styles.controls}>
			<input
				type="range"
				min={0}
				max={totalPages - 1}
				value={currentPage}
				onChange={(e) => handleSliderChange(Number(e.target.value))}
				className={styles.slider}
			/>

			<div className={styles.pageInputWrapper}>
				<input
					type="number"
					max={totalPages}
					value={inputPage}
					onChange={(e) => {
						const val = Number(e.target.value);
						if (!isNaN(val)) {
							setInputPage(
								Math.max(1, Math.min(totalPages, val)),
							);
						}
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
				<button onClick={toggleFullscreen} className={styles.tabButton}>
					{isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
				</button>
			</div>
		</div>
	);

	if (accessDenied) {
		const accessDeniedIcon = (
			<MdLock className="mx-auto h-24 w-24 text-red-400" />
		);

		return (
			<ErrorPage
				icon={accessDeniedIcon}
				title="Akses Ditolak"
				message="Anda tidak memiliki akses untuk konten ini."
				background="bg-gradient-to-br from-red-50 to-pink-100"
				buttonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
			/>
		);
	}

	return isMobile && !isLandscape ? (
		<div className={styles.mobileContainer}>
			{/* 🔥 GLOBAL LOADING OVERLAY */}
			{loading && (
				<div className={styles.globalLoader}>
					<div className={styles.spinner}></div>
					<p className={styles.loadingText}>
						Mempersiapkan buku Anda...
					</p>
				</div>
			)}

			{/* BRAND */}
			<Link href="/">
				<div className={`${styles.brand} ${styles.topBar}`}>
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
					showCover={isMobile ? false : true}
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
								<div className="w-full h-full bg-[#fdfcf7] flex items-center justify-center">
									<div className={styles.spinner}></div>
								</div>
							)}
						</div>
					))}
				</HTMLFlipBook>

				<button
					onClick={goPrev}
					className={`${styles.navButton} ${styles.left} ${styles.navFixed}`}
				>
					‹
				</button>

				<button
					onClick={goNext}
					className={`${styles.navButton} ${styles.right} ${styles.navFixed}`}
				>
					›
				</button>
			</div>

			<div
				className={`${styles.mobileTab} ${isLandscape ? styles.mobileTabSticky : ""}`}
			>
				<button
					className={styles.tabButton}
					onClick={() => setShowTools(!showTools)}
				>
					<MdBuild />
				</button>
				<button className={styles.tabButton}>
					<MdChat />
				</button>
				<button className={styles.tabButton}>
					<MdShare />
				</button>
			</div>

			<div
				className={`${styles.toolsOverlay} ${isLandscape ? styles.toolsOverlayFixed : ""} ${showTools ? styles.toolsOverlayVisible : ""}`}
			>
				{controls}
			</div>
		</div>
	) : (
		<div
			className={`${isLandscape ? styles.containerScroll : styles.container}`}
		>
			{/* 🔥 GLOBAL LOADING OVERLAY */}
			{loading && (
				<div className={styles.globalLoader}>
					<div className={styles.spinner}></div>
					<p className={styles.loadingText}>
						Mempersiapkan buku Anda...
					</p>
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

			<div
				className={`${isLandscape ? styles.bookWrapperScroll : styles.bookWrapper}`}
			>
				<HTMLFlipBook
					ref={bookRef}
					width={size.width}
					height={size.height}
					flippingTime={900}
					drawShadow={true}
					useMouseEvents={isLandscape ? false : true}
					className={styles.flipBook}
					onFlip={onFlip}
					showCover={isMobile ? false : true}
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
								<div className="w-full h-full bg-[#fdfcf7] flex items-center justify-center">
									<div className={styles.spinner}></div>
								</div>
							)}
						</div>
					))}
				</HTMLFlipBook>

				<button
					onClick={goPrev}
					className={`${styles.navButton} ${styles.left} ${styles.navFixed}`}
				>
					‹
				</button>

				<button
					onClick={goNext}
					className={`${styles.navButton} ${styles.right} ${styles.navFixed}`}
				>
					›
				</button>

				{isLandscape ? (
					<>
						<div
							className={`${styles.mobileTab} ${isLandscape ? styles.mobileTabSticky : ""}`}
						>
							<button
								className={styles.tabButton}
								onClick={() => setShowTools(!showTools)}
							>
								<MdBuild />
							</button>
							<button className={styles.tabButton}>
								<MdChat />
							</button>
							<button className={styles.tabButton}>
								<MdShare />
							</button>
						</div>
					</>
				) : (
					<>
						<div
							className={`${styles.footer} ${isLandscape ? styles.footerSticky : !isMobile ? styles.footerFixed : ""}`}
						>
							{controls}
						</div>
					</>
				)}
				{showTools && (
					<div
						className={`${styles.toolsOverlay} ${isLandscape ? styles.toolsOverlayFixed : ""}`}
					>
						{controls}
					</div>
				)}
			</div>
		</div>
	);
}
