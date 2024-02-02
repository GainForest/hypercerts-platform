import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";
import {
	Circle,
	GlassWater,
	Heart,
	Lightbulb,
	MapPin,
	Salad,
	Search,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Report } from "~/types";
import { fetchReports } from "../impact-reports.server";

const iconComponents: { [key: string]: LucideIcon } = {
	Hunger: Salad,
	Thirst: GlassWater,
	Opportunity: Lightbulb,
	Dignity: Heart,
};

function GetIcon(props: {
	category: string;
	color: string;
	strokeWidth: string;
	size: string;
}) {
	const CategoryIcon = iconComponents[props.category];
	return (
		<CategoryIcon
			color={props.color}
			strokeWidth={props.strokeWidth}
			size={props.size}
		/>
	);
}

export const meta: MetaFunction = () => {
	return [
		{ title: "VoiceDeck" },
		{ name: "description", content: "Welcome to VoiceDeck!" },
	];
};

export const loader: LoaderFunction = async () => {
	const ownerAddress = process.env.HC_OWNER_ADDRESS;
	if (!ownerAddress)
		throw new Error("Owner address environment variable is not set");
	try {
		const response = await fetchReports(ownerAddress);
		return json(response);
	} catch (error) {
		console.error(`Failed to load impact reports: ${error}`);
		throw new Response("Failed to load impact reports", { status: 500 });
	}
};

export default function Index() {
	const reports = useLoaderData<typeof loader>();
	return (
		<main className="flex flex-col gap-8 md:gap-6 justify-center items-center p-4 md:px-[15%]">
			<header className="flex-row bg-[url('/hero_imgLG.jpg')] bg-cover bg-center justify-start items-baseline text-vd-beige-200 rounded-3xl p-4 pt-24 md:pt-36 md:pr-48 md:pb-2 md:pl-8 max-w-[1372px]">
				<h1 className="text-6xl font-bold text-left">
					From individual actions to collective impact
				</h1>
				<h2 className="text-lg font-medium text-left py-6">
					We enable journalists to effect real change by bringing critical
					stories to light. Your contributions directly support this mission,
					sustaining journalism and bolstering investigative reporting that
					matters.
				</h2>
			</header>

			<section className="flex flex-col lg:flex-row w-full gap-3 lg:gap-3 max-w-[1372px]">
				<div className="flex flex-auto items-center gap-4 lg:w-[33%] rounded-3xl bg-vd-blue-200 p-4">
					<img src={"/blue_flower.svg"} alt="blue flower drawing" />
					<div className="flex flex-col gap-2">
						<p className="text-base font-medium">Total Supporters</p>
						<p className="text-3xl md:text-3xl font-bold">104</p>
					</div>
				</div>
				<div className="flex flex-auto items-center gap-4 lg:w-[33%] rounded-3xl bg-vd-blue-200 p-4">
					<img src={"/blue_elephant.svg"} alt="blue elephant drawing" />
					<div className="flex flex-col gap-2">
						<p className="text-base font-medium">Total Support Received</p>
						<p className="text-3xl md:text-3xl font-bold">
							3.6K <span className="text-lg">USD</span>
						</p>
					</div>
				</div>
				<div className="flex flex-auto items-center gap-4 lg:w-[33%] rounded-3xl bg-vd-blue-200 p-4">
					<img src={"/blue_candle.svg"} alt="blue candle drawing" />
					<div className="flex flex-col gap-2">
						<p className="text-base font-medium"># of Reports Fully Funded</p>
						<p className="text-3xl md:text-3xl font-bold">12</p>
					</div>
				</div>
			</section>

			<article className="w-full max-w-[1372px]">
				<h2 className="text-3xl md:text-4xl font-semibold pt-6">Reports</h2>
				<div className="flex flex-col md:flex-row md:justify-between md:items-end pb-8">
					<p className="text-base pb-4 md:pb-0 ">
						Find and fund reports that resonate with you.
					</p>
					<div className="flex flex-col md:flex-row gap-3">
						<Input type="search" placeholder="Search Reports" />
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="amount-needed">Amount Needed</SelectItem>
								<SelectItem value="newest-oldest">Newest to Oldest</SelectItem>
								<SelectItem value="oldest-newest">Oldest to Newest</SelectItem>
								<SelectItem value="most-contributors">
									Most Contributors
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-10 pb-16">
					<section>
						<div className="border border-b-vd-blue-400 py-4">
							<h2 className="text-xl font-medium pb-8">Categories</h2>
							{Array.from(
								new Set(reports.map((report: Report) => report.category)),
							).map((category) => (
								<div className="flex items-center gap-2 pb-3">
									{GetIcon({
										category: category as string,
										color: "#E48F85",
										strokeWidth: "1.5",
										size: "36",
									})}
									<p>{category as string}</p>
								</div>
							))}
						</div>
						<div className="border border-b-vd-blue-400 pt-8 pb-4">
							<h2 className="text-xl font-medium pb-8">Amount needed</h2>
							{Array.from(
								new Set(reports.map((report: Report) => report.fundedSoFar)),
							).map((fundedSoFar) => (
								<div className="flex items-center gap-2 pb-3">
									<Circle />
									<p>${1000 - (fundedSoFar as number)}</p>
								</div>
							))}
						</div>
						<div className="border border-b-vd-blue-400 pt-8 pb-4">
							<h2 className="text-xl font-medium pb-8">Story from</h2>
							{Array.from(
								new Set(reports.map((report: Report) => report.id)),
							).map((id) => (
								<div className="flex items-center gap-2 pb-3">
									<Circle />
									<p>{(id as string).slice(0, 15)}</p>
								</div>
							))}
						</div>
						<div className="border border-b-vd-blue-400 pt-8 pb-4">
							<h2 className="text-xl font-medium pb-8">State</h2>
							{Array.from(
								new Set(reports.map((report: Report) => report.state)),
							).map((state) => (
								<div className="flex items-center gap-2 pb-3">
									<Circle />
									<p>{state as string}</p>
								</div>
							))}
						</div>
						<div className="flex flex-col gap-5 pt-8 pb-4">
							<Button>Apply</Button>
							<Button variant={"outline"}>Clear all</Button>
						</div>
					</section>
					<section className="flex flex-wrap gap-5">
						{reports.map((report: Report) => (
							<Card key={report.id}>
								<div className="h-[250px] overflow-hidden">
									<img
										src={report.image}
										alt="gpt-generated report illustration"
										className="object-none object-top rounded-3xl"
									/>
								</div>
								<CardHeader>
									<CardTitle>{report.title}</CardTitle>
									<CardDescription>{report.summary}</CardDescription>
								</CardHeader>
								<CardContent>
									<Badge>
										{GetIcon({
											category: report.category,
											color: "#C14E41",
											strokeWidth: "1",
											size: "24",
										})}
										<p>{report.category}</p>
									</Badge>
									<Badge>
										<MapPin color="#C14E41" strokeWidth={1} size={24} />
										<p>{report.state}</p>
									</Badge>
								</CardContent>
								<CardFooter>
									<Progress value={report.fundedSoFar / 10} />
									<p>${report.totalCost - report.fundedSoFar} still needed</p>
								</CardFooter>
							</Card>
						))}
					</section>
				</div>
			</article>
		</main>
	);
}
