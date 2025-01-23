import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "vaul/dist/index.css";
import "./globals.css";

import { cookieToInitialState } from "wagmi";

import { Footer } from "@/components/global/footer";
import { NavMenu } from "@/components/global/nav-menu";
import { siteConfig } from "@/config/site";
import { config } from "@/config/wagmi";
import { WagmiContextProvider } from "@/contexts/wagmi";
import { headers } from "next/headers";
import Script from "next/script";

const baskerville = localFont({
	src: [
		{
			path: "./fonts/BaskervilleDisplayPT/Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/BaskervilleDisplayPT/Italic.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "./fonts/BaskervilleDisplayPT/Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/BaskervilleDisplayPT/MediumItalic.ttf",
			weight: "500",
			style: "italic",
		},
		{
			path: "./fonts/BaskervilleDisplayPT/Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/BaskervilleDisplayPT/BoldItalic.ttf",
			weight: "700",
			style: "italic",
		},
	],
	variable: "--font-baskerville",
});

const archia = localFont({
	src: [
		{
			path: "./fonts/Archia/Regular.otf",
			weight: "400",
			style: "regular",
		},
	],
	variable: "--font-archia",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://app.voicedeck.org/"),
	title: { default: siteConfig.name, template: "%s | GainForest.Earth" },
	description: siteConfig.description,
	icons: [
		{
			rel: "icon",
			type: "image/x-icon",
			url: "/favicon.ico",
			media: "(prefers-color-scheme: light)",
		},
		{
			rel: "icon",
			type: "image/png",
			url: "/favicon-dark.ico",
			media: "(prefers-color-scheme: dark)",
		},
	],
	openGraph: {
		title: { default: "Nature Project", template: "%s | GainForest.Earth" },
		description: siteConfig.description,
		type: "website",
		images: [{ url: "/opengraph-image.png", alt: "GainForest.Earth" }],
	},
	twitter: {
		card: "summary_large_image",
		site: "@edge-esmeralda",
		title: { default: "Nature Project", template: "%s | GainForest.Earth" },
		description: siteConfig.description,
		images: [{ url: "/opengraph-image.png", alt: "GainForest.Earth" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const initialState = cookieToInitialState(config, headers().get("cookie"));
	return (
		<html lang="en">
			<body
				className={cn(
					"flex min-h-screen flex-col antialiased",
					baskerville.variable,
					archia.variable,
				)}
			>
				<WagmiContextProvider initialState={initialState}>
					<NavMenu />
					<div className="flex-1">{children}</div>
					<Footer />
				</WagmiContextProvider>
			</body>
		</html>
	);
}
