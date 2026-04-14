import {
	MdFullscreen,
	MdFullscreenExit,
	MdChat,
	MdShare,
} from "react-icons/md";

const JUMP_PRELOAD_RANGE = 2;
const SLIDER_DEBOUNCE = 250;

export default function Controls({
	styles,
	currentPage,
	totalPages,
	inputPage,
	isFullscreen,
	isMobile,
	setCurrentPage,
	setInputPage,
	loadPage,
	bookRef,
	setIsFullscreen,
	debounceRef,
	setOpen,
}) {
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
		}
	};
	return (
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
				{!isMobile && (
					<>
						<button
							className={styles.tabButton}
							onClick={() => setOpen(true)}
						>
							<MdChat />
						</button>
						<button className={styles.tabButton}>
							<MdShare />
						</button>
					</>
				)}
			</div>
		</div>
	);
}
