"use client";

import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const Toolbar = ({ totalPages, jumpToPage, setJumpToPage, jumpTo }) => {
	return (
		<div className="sticky top-3 z-40 bg-white border border-gray-200 shadow-md rounded-2xl p-4 sm:p-5 mb-8">
			<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
				<div className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">
					Lompat ke Halaman
				</div>

				<div className="flex w-full gap-2 sm:gap-3">
					<button
						onClick={() => jumpTo(1)}
						className="px-4 py-3 text-white rounded-xl transition active:scale-95 flex justify-center"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						<FaChevronUp size={18} />
					</button>

					<input
						type="number"
						min={1}
						max={totalPages}
						value={jumpToPage}
						onChange={(e) => setJumpToPage(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const page = Number(jumpToPage);
								if (page >= 1 && page <= totalPages) {
									jumpTo(page);
									setJumpToPage("");
								}
							}
						}}
						placeholder={`1-${totalPages}`}
						className="flex-1 text-gray-800 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
					/>

					<button
						onClick={() => jumpTo(totalPages)}
						className="px-4 py-3 text-white rounded-xl transition active:scale-95 flex justify-center"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						<FaChevronDown size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default Toolbar;
