"use client";

import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef } from "react";
import styles from "./ebook.module.css";
import Link from "next/link";
import ErrorPage from "@/components/body/ErrorPage";
import useBookSize from "./hooks/useBookSize";
import useAuth from "./hooks/useAuth";
import Controls from "./components/controls";
import { MdLock, MdBuild, MdChat, MdShare } from "react-icons/md";
import { TbMessageCircleQuestion } from "react-icons/tb";

const PAGE_BUFFER = 25;
export default function FlipBookReader({ contentNumber, title, totalPages }) {
	const [open, setOpen] = useState(false);

	const [pages, setPages] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [inputPage, setInputPage] = useState(1);
	const [accessDenied, setAccessDenied] = useState(false);

	const [showTools, setShowTools] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const tokenRef = useRef(null);
	const loadingSet = useRef(new Set());
	const cacheRef = useRef({});
	const bookRef = useRef(null);
	const debounceRef = useRef(null);

	const { size, isLandscape, isMobile } = useBookSize();

	const {
		token,
		isAuthenticated,
		loading: authLoading,
	} = useAuth(contentNumber, title);

	useEffect(() => {
		if (isAuthenticated && token) {
			tokenRef.current = token;
			Promise.all([loadPage(0, 0), loadPage(1, 0), loadPage(2, 0)]).then(
				() => setLoading(false),
			);
		}
	}, [isAuthenticated, token]);

	useEffect(() => {
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

	const goNext = () => bookRef.current?.pageFlip().flipNext();
	const goPrev = () => bookRef.current?.pageFlip().flipPrev();

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

	return (
		<>
			{" "}
			{isMobile && !isLandscape ? (
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
							useMouseEvents={false}
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
											<div
												className={styles.spinner}
											></div>
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
						<button
							onClick={() => setOpen(true)}
							className={styles.tabButton}
						>
							<MdChat />
						</button>
						<button className={styles.tabButton}>
							<MdShare />
						</button>
					</div>

					<div
						className={`${styles.toolsOverlay} ${isLandscape ? styles.toolsOverlayFixed : ""} ${showTools ? styles.toolsOverlayVisible : ""}`}
					>
						<Controls
							styles={styles}
							currentPage={currentPage}
							totalPages={totalPages}
							inputPage={inputPage}
							isFullscreen={isFullscreen}
							isMobile={isMobile}
							setCurrentPage={setCurrentPage}
							setInputPage={setInputPage}
							loadPage={loadPage}
							bookRef={bookRef}
							setIsFullscreen={setIsFullscreen}
							debounceRef={debounceRef}
							setOpen={setOpen}
						/>
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
											<div
												className={styles.spinner}
											></div>
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
									<button
										className={styles.tabButton}
										onClick={() => setOpen(true)}
									>
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
									<Controls
										styles={styles}
										currentPage={currentPage}
										totalPages={totalPages}
										inputPage={inputPage}
										isFullscreen={isFullscreen}
										isMobile={isMobile}
										setCurrentPage={setCurrentPage}
										setInputPage={setInputPage}
										loadPage={loadPage}
										bookRef={bookRef}
										setIsFullscreen={setIsFullscreen}
										debounceRef={debounceRef}
										setOpen={setOpen}
									/>
								</div>
							</>
						)}
						<div
							className={`${styles.toolsOverlay} ${isLandscape ? styles.toolsOverlayFixed : ""} ${showTools ? styles.toolsOverlayVisible : ""}`}
						>
							<Controls
								styles={styles}
								currentPage={currentPage}
								totalPages={totalPages}
								inputPage={inputPage}
								isFullscreen={isFullscreen}
								isMobile={isMobile}
								setCurrentPage={setCurrentPage}
								setInputPage={setInputPage}
								loadPage={loadPage}
								bookRef={bookRef}
								setIsFullscreen={setIsFullscreen}
								debounceRef={debounceRef}
								setOpen={setOpen}
							/>
						</div>
					</div>
				</div>
			)}
			{/* Full Screen Drawer */}
			<div
				className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 ${
					open ? "translate-y-0" : "translate-y-full"
				}`}
			>
				{/* Header */}
				<div className="flex justify-between items-center p-4 border-b bg-[#404040]">
					<h2 className="text-lg font-semibold">Full Drawer</h2>
					<button onClick={() => setOpen(false)}>✕</button>
				</div>

				{/* Content */}
				<div className="p-4 overflow-y-auto h-[calc(100%-64px)] bg-[#404040]">
					<p>Main content here...</p>
					<p>Scroll works independently</p>
				</div>
			</div>
		</>
	);
}
