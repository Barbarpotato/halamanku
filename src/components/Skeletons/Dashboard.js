export default function DashboardLoading() {
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
					</div>
				</div>

				<div className="page-header">
					<div>
						<h1 className="page-header-title">Dashboard</h1>
						<p className="page-header-description">
							Manage your content
						</p>
					</div>
					<div className="animate-pulse bg-slate-200 h-10 w-40 rounded"></div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="bg-white p-6 rounded-lg shadow-md border"
						>
							<div className="animate-pulse h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
							<div className="animate-pulse h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
							<div className="animate-pulse h-16 bg-slate-200 rounded w-full mb-4"></div>
							<div className="flex justify-between items-center">
								<div className="animate-pulse h-4 bg-slate-200 rounded w-16"></div>
								<div className="flex gap-2">
									<div className="animate-pulse h-8 bg-slate-200 rounded w-12"></div>
									<div className="animate-pulse h-8 bg-slate-200 rounded w-16"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
