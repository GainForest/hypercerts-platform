import type { Hypercert } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { type SupportedChainIdType, supportedChains } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Progress from "../shared/progress";

// * REFACTORED from hypercerts-app hypercert-window
const Card = ({ hypercert }: { hypercert: Hypercert }) => {
	const {
		hypercertId,
		name,
		description,
		image,
		totalUnits,
		unitsForSale,
		pricePerPercentInUSD,
		chainId,
	} = hypercert;

	const chainName = supportedChains.find((x) => x.id === Number(chainId))?.name;
	const percentAvailable = calculateBigIntPercentage(unitsForSale, totalUnits);
	return (
		<Link href={`/hypercert/${hypercertId}`} passHref>
			<article className="group relative overflow-hidden rounded-2xl border border-border bg-muted">
				<div className="h-[320px] w-full">
					<div className="relative h-full w-full overflow-hidden">
						<Image
							// src={`/api/hypercert/${hypercert_id}/image`}
							src={image ?? ""}
							alt={name ?? "Untitled"}
							fill
							sizes="300px"
							className="h-auto w-full object-contain object-center transition group-hover:scale-[1.05]"
						/>
					</div>
				</div>
				<section className="absolute top-4 left-4 flex space-x-1 opacity-100 transition-opacity duration-150 ease-out group-hover:opacity-100 md:opacity-0">
					<div className="rounded-md border border-white/60 bg-black px-2 py-0.5 text-white text-xs shadow-sm">
						{chainName ?? "Unknown chain"}
					</div>
					<div className="rounded-md border border-black/60 bg-black px-2 py-0.5 text-white text-xs shadow-sm">
						approved
					</div>
				</section>
				<section
					className="absolute bottom-0 w-full space-y-2 border-t border-t-border bg-background/90 p-4 backdrop-blur-md"
					style={{
						boxShadow: "0 -10px 10px rgba(0, 0, 0, 0.1)",
					}}
				>
					<p
						className={cn(
							"line-clamp-2 h-10 flex-1 text-ellipsis break-words font-semibold text-lg leading-5",
							name
								? "font-baskerville text-foreground"
								: "text-muted-foreground",
						)}
					>
						{name ?? "[Untitled]"}
					</p>
					<p
						className={
							"line-clamp-2 h-10 flex-1 text-ellipsis text-muted-foreground text-sm"
						}
					>
						{description ?? "..."}
					</p>
					{pricePerPercentInUSD === undefined ? (
						<div className="flex w-full items-center justify-start text-muted-foreground text-sm">
							<span className="inline-block rounded-full bg-beige-muted px-2 text-beige-muted-foreground">
								Coming Soon...
							</span>
						</div>
					) : unitsForSale === undefined || unitsForSale === 0n ? (
						<div className="flex w-full items-center justify-start text-muted-foreground text-sm">
							<span className="inline-block rounded-full bg-destructive/20 px-2 text-destructive">
								Sold
							</span>
						</div>
					) : (
						<>
							<Progress percentage={100 - (percentAvailable ?? 0)} />
							<div className="flex w-full items-center justify-start text-muted-foreground text-sm">
								<span className="inline-block rounded-full bg-primary/20 px-2 text-primary">
									$
									{Math.floor(
										(percentAvailable ?? 0) * pricePerPercentInUSD * 100,
									) / 100}{" "}
									left
								</span>
							</div>
						</>
					)}
				</section>
			</article>
		</Link>
	);
};

export default Card;
