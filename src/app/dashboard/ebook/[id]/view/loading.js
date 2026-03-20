export default function Loading() {
	return (
		<div className="page-container">
			<div className="main">
				<div className="page-header animate-pulse">
					<div className="flex items-center gap-4">
						<div className="h-6 bg-slate-200 rounded w-20"></div>
						<div className="h-4 bg-slate-200 rounded w-16"></div>
					</div>
					<div className="flex gap-2">
						<div className="h-8 bg-slate-200 rounded w-16"></div>
						<div className="h-8 bg-slate-200 rounded w-20"></div>
						<div className="h-8 bg-slate-200 rounded w-24"></div>
					</div>
				</div>

				<div className="card">
					<div className="animate-pulse">
						<div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
						<div className="space-y-4">
							<div>
								<div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
								<div className="h-10 bg-slate-200 rounded w-full"></div>
							</div>
							<div>
								<div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
								<div className="h-24 bg-slate-200 rounded w-full"></div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
									<div className="h-10 bg-slate-200 rounded w-full"></div>
								</div>
								<div>
									<div className="h-4 bg-slate-200 rounded w-18 mb-2"></div>
									<div className="h-10 bg-slate-200 rounded w-full"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
