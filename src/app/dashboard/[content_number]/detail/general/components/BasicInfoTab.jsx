"use client";

import { useState, useRef, useEffect } from "react";
import { uploadPdf, getPdfUrl, deletePdf } from "@/services/userContent/pdf";
import { updateEbookUserContent } from "@/services/userContent/update";
import { MdPhoto, MdDescription, MdClose } from "react-icons/md";

export default function BasicInfoTab({
	content,
	formData,
	setFormData,
	readOnly = false,
	setError,
	modal,
	onSave,
	loading,
}) {
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const isPublished = content?.is_published === true;

	const fileInputRef = useRef(null);

	// PDF file state
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfPath, setPdfPath] = useState(content.storage_file_name || "");
	const [previewUrl, setPreviewUrl] = useState(null);

	const [pdfLoading, setPdfLoading] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(!!pdfPath);

	useEffect(() => {
		const loadPreviewUrl = async () => {
			if (pdfPath) {
				setPreviewLoading(true);
				try {
					const signedUrl = await getPdfUrl(pdfPath);
					setPreviewUrl(signedUrl);
				} catch (err) {
					console.error("Failed to get preview URL:", err);
				} finally {
					setPreviewLoading(false);
				}
			} else {
				setPreviewUrl(null);
				setPreviewLoading(false);
			}
		};
		loadPreviewUrl();
	}, [pdfPath]);

	// Handle file selection
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.type !== "application/pdf") {
				setError("Hanya file PDF yang diperbolehkan");
				return;
			}
			setPdfFile(file);
			setError(null);
		}
	};

	// Upload new PDF
	const handleUploadPdf = async () => {
		if (!pdfFile) {
			setError("Silakan pilih file terlebih dahulu");
			return;
		}

		setPdfLoading(true);
		setError(null);

		try {
			const path = await uploadPdf(content.id, pdfFile);
			setPdfPath(path);
			setPdfFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// Delete PDF
	const handleDeletePdf = async () => {
		if (!pdfPath) {
			setError("Tidak ada file untuk dihapus");
			return;
		}

		const confirmed = await modal.confirm({
			message: "Apakah Anda yakin ingin menghapus file PDF?",
		});
		if (!confirmed) {
			return;
		}

		setPdfLoading(true);
		setError(null);

		try {
			await deletePdf(content.id, pdfPath);
			await updateEbookUserContent(content.id, {
				storage_file_name: null,
			});
			setPdfPath("");
			setPreviewUrl(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setPdfLoading(false);
		}
	};

	return (
		<div className="mb-xl">
			<h2 className="section-title my-2">Informasi Umum</h2>
			<div className="flex flex-col lg:flex-row gap-8">
				{/* PDF Section */}
				<div className="flex-1">
					{pdfPath ? (
						<div className="field">
							<div className="mb-4">
								<div
									className="border border-gray-300 rounded-lg overflow-hidden bg-white"
									style={{ height: "400px" }}
								>
									{previewLoading ? (
										<div className="flex items-center justify-center h-full">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
										</div>
									) : previewUrl ? (
										<iframe
											src={previewUrl}
											width="100%"
											height="100%"
											style={{ border: "none" }}
											title="PDF Preview"
										></iframe>
									) : (
										<div className="flex items-center justify-center h-full text-gray-500">
											Gagal memuat pratinjau
										</div>
									)}
								</div>
							</div>
						</div>
					) : readOnly ? (
						<div className="field">
							<div className="field-value">
								Tidak ada PDF yang diunggah
							</div>
						</div>
					) : (
						<>
							{/* Show file input only if no file is uploaded yet */}
							{!pdfPath && !pdfFile && (
								<div className="field">
									<label className="field-label">
										Unggah File PDF
									</label>
									<div
										onClick={triggerFileInput}
										className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
									>
										<MdPhoto className="mx-auto h-12 w-12 text-gray-400" />
										<div className="mt-4">
											<p className="text-sm text-gray-500">
												Klik untuk mengunggah file PDF
											</p>
											<p className="text-xs text-gray-400">
												Hanya file PDF
											</p>
										</div>
									</div>
									<input
										type="file"
										ref={fileInputRef}
										accept=".pdf"
										onChange={handleFileChange}
										disabled={isPublished}
										className="hidden"
									/>
								</div>
							)}

							{/* Show selected file details if file is selected but not uploaded */}
							{pdfFile && !pdfPath && (
								<div className="field">
									<label className="field-label">
										File PDF yang Dipilih
									</label>
									<div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												<MdDescription className="h-8 w-8 text-red-500 mr-3" />
												<div>
													<p className="text-sm font-medium text-gray-900">
														{pdfFile.name}
													</p>
													<p className="text-xs text-gray-500">
														{(
															pdfFile.size /
															1024 /
															1024
														).toFixed(2)}{" "}
														MB
													</p>
												</div>
											</div>
											<button
												type="button"
												onClick={() => {
													setPdfFile(null);
													if (fileInputRef.current) {
														fileInputRef.current.value =
															"";
													}
												}}
												className="text-gray-400 hover:text-gray-600"
											>
												<MdClose className="h-5 w-5" />
											</button>
										</div>
									</div>
								</div>
							)}

							{pdfFile && !pdfPath && (
								<div className="mt-4">
									<button
										type="button"
										onClick={handleUploadPdf}
										disabled={pdfLoading || !pdfFile}
										className="btn-primary"
									>
										{pdfLoading
											? "Mengunggah..."
											: "Unggah PDF"}
									</button>
								</div>
							)}
						</>
					)}
				</div>

				{/* Basic Information Section */}
				<div className="flex-1 ">
					<div className="field">
						<label className="field-label">Judul</label>
						{readOnly ? (
							<div className="field-value">
								{content.ebook_user_content_title ||
									"Tanpa judul"}
							</div>
						) : (
							<input
								type="text"
								id="ebook_user_content_title"
								name="ebook_user_content_title"
								value={formData.ebook_user_content_title}
								onChange={handleChange}
								placeholder="Masukkan judul ebook"
								className="field-input"
							/>
						)}
					</div>
					<div className="field">
						<label className="field-label">Deskripsi</label>
						{readOnly ? (
							<div className="field-value">
								{content.ebook_user_content_description ||
									"Tidak ada deskripsi yang diberikan."}
							</div>
						) : (
							<textarea
								id="ebook_user_content_description"
								name="ebook_user_content_description"
								value={formData.ebook_user_content_description}
								onChange={handleChange}
								rows={4}
								style={{ resize: "none" }}
								placeholder="Masukkan deskripsi ebook"
								className="field-input"
							/>
						)}

						<div className="field mt-2">
							<label className="field-label flex items-center">
								<input
									type="checkbox"
									id="is_private"
									name="is_private"
									checked={formData.is_private}
									onChange={handleChange}
									disabled={isPublished}
									className="mr-2 h-4 w-4"
								/>
								<p>
									Hanya pengguna yang memiliki akses yang
									dapat melihat konten ini
								</p>
							</label>
						</div>

						{!readOnly && (
							<button
								type="button"
								onClick={onSave}
								disabled={loading}
								className="btn-primary"
							>
								{loading ? "Memuat..." : "Simpan Perubahan"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
