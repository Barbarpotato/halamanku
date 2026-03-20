import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { GlobalLoaderProvider } from "@/components/GlobalLoaderProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "Halamanku",
	description: "Where knowledge is shared and shaped",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<QueryProvider>
					<ModalProvider>
						<GlobalLoaderProvider>{children}</GlobalLoaderProvider>
					</ModalProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
