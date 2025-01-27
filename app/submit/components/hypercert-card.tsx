import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkle } from "lucide-react";
import Image from "next/image";
import { forwardRef, memo } from "react";

export interface HypercertCardProps {
	title?: string;
	description?: string;
	badges?: string[];
	banner?: string;
	logo?: string;
	workStartDate?: Date;
	workEndDate?: Date;
	displayOnly?: boolean;
	hypercertId?: string;
	contributors?: string[];
}

const HypercertCard = forwardRef<HTMLDivElement, HypercertCardProps>(
	(
		{
			title = "Hypercert Title",
			description = "Your description here",
			badges,
			banner,
			workStartDate,
			workEndDate,
			logo,
			hypercertId,
			displayOnly = false,
			contributors = [],
		}: HypercertCardProps,
		ref,
	) => {
		title = title ?? "Your title here";
		description = description ?? "Your description here";

		// TODO: Create a date formatter function
		const formattedDateRange =
			workStartDate && workEndDate
				? workStartDate === workEndDate
					? workStartDate.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
					  })
					: `${workStartDate.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
					  })} - ${workEndDate.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
					  })}`
				: "";

		return (
			<article
				ref={ref}
				className="relative w-[275px] overflow-clip rounded-xl border-[1.5px] border-slate-500 bg-black"
			>
				<header className="relative flex h-[135px] w-full items-center justify-center overflow-clip rounded-b-xl">
					{banner ? (
						<Image
							src={`https://cors-proxy.hypercerts.workers.dev/?url=${banner}`}
							alt={`${title} banner`}
							className="object-cover object-center"
							fill
							unoptimized
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-slate-200">
							<span className="text-lg text-slate-500">Your banner here</span>
						</div>
					)}
				</header>
				<section className="absolute top-4 left-3 overflow-hidden rounded-full border-2 border-white bg-slate-200">
					<div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-300">
						{logo ? (
							<Image
								src={`https://cors-proxy.hypercerts.workers.dev/?url=${logo}`}
								alt={`${title} logo`}
								fill
								unoptimized
								className="object-cover"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center bg-slate-300">
								<Sparkle size={24} />
							</div>
						)}
					</div>
				</section>
				<section className="space-y-2 rounded-t-xl border-black border-t-[1.5px] bg-white p-3 pt-4">
					<div className="flex items-center">
						<span className="text-slate-600 text-xs uppercase">
							{formattedDateRange}
						</span>
					</div>
					<h5
						className="line-clamp-2 h-10 text-ellipsis font-semibold text-base text-slate-800 leading-tight tracking-tight"
						title={title}
					>
						{title}
					</h5>
					<p className="line-clamp-2 text-slate-600 text-sm">{description}</p>
					{Array.isArray(contributors) && contributors.length > 0 && (
						<div className="flex flex-col gap-1">
							<div className="flex flex-wrap gap-1">
								{contributors.map((address: string) => (
									<Badge key={address} variant="outline">
										{address && `${address.slice(0, 6)}...${address.slice(-4)}`}
									</Badge>
								))}
							</div>
						</div>
					)}
					<ScrollArea className="h-[50px]">
						<div className="flex flex-wrap gap-1">
							{badges?.map((badge) => (
								<Badge key={badge} variant="secondary">
									{badge}
								</Badge>
							))}
						</div>
					</ScrollArea>
				</section>
			</article>
		);
	},
);

HypercertCard.displayName = "HypercertCard";

export default memo(HypercertCard);
