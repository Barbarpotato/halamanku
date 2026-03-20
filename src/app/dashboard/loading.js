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

				<div className="page-header">
					<div>
						<h1 className="page-header-title">Dashboard</h1>
						<p className="page-header-description">
							Manage your ebook content
						</p>
					</div>
					<div className="animate-pulse bg-slate-200 h-10 w-40 rounded"></div>
				</div>

				<div className="table-container mt-6 p-4">
					<table className="w-full border-collapse">
						<thead>
							<tr className="text-left border-b">
								<th className="py-3">Title</th>
								<th>Status</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>

						<tbody>
							{Array.from({ length: 6 }).map((_, i) => (
								<tr key={i} className="border-b">
									<td className="py-4">
										<div className="animate-pulse h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
										<div className="animate-pulse h-3 bg-slate-200 rounded w-1/2"></div>
									</td>

									<td>
										<div className="animate-pulse h-4 bg-slate-200 rounded w-16"></div>
									</td>

									<td>
										<div className="animate-pulse h-4 bg-slate-200 rounded w-24"></div>
									</td>

									<td>
										<div className="flex gap-2">
											<div className="animate-pulse h-8 bg-slate-200 rounded w-12"></div>
											<div className="animate-pulse h-8 bg-slate-200 rounded w-16"></div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
