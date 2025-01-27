"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, isValidEthereumAddress } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type HypercertMetadata,
	formatHypercertData,
} from "@hypercerts-org/sdk";

import { Dialog } from "@/components/ui/dialog";
import useMintHypercert from "@/hooks/use-mint-hypercert";
import { toPng } from "html-to-image";
import hypercertCard from "./hypercert-card";
import HypercertCard from "./hypercert-card";
import { HypercertMintDialog } from "./hypercert-mint-dialog";

const telegramHandleRegex = /^@([a-zA-Z0-9_]{4,31})$/;
const emailRegex =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const HypercertMintSchema = z.object({
	title: z
		.string()
		.min(1, { message: "Hypercert Name is required" })
		.max(100, { message: "Hypercert Name must be less than 50 characters" }),
	description: z
		.string()
		.min(10, {
			message: "Description is required and must be at least 10 characters",
		})
		.max(500, { message: "Description must be less than 500 characters" }),
	link: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.string().url().optional(),
	),
	logo: z.string().url({ message: "Logo Image must be a valid URL" }),
	banner: z
		.string()
		.url({ message: "Background Banner Image must be a valid URL" }),
	tags: z
		.string()
		.refine((val) => val.split(",").every((tag) => tag.trim() !== ""), {
			message:
				"Tags must must not be empty, Multiple tags must be separated by commas",
		}),
	projectDates: z
		.tuple([z.date().optional(), z.date().optional()])
		.refine((data) => {
			return Boolean(data[0] || data[1]);
		}, "Work date range is required"),
	contributors: z.string().refine(
		(value) => {
			const addresses = value.split(", ").map((addr) => addr.trim());
			return addresses.every((address) => isValidEthereumAddress(address));
		},
		{
			message:
				"Each value must be a valid Ethereum address separated by a comma and a space.",
		},
	),
	contact: z
		.string()
		.refine(
			(value) =>
				telegramHandleRegex.test(value) ||
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
			{
				message: "Input must be a valid Telegram handle or email address",
			},
		),
	acceptTerms: z.boolean(),
	confirmContributorsPermission: z.boolean(),
	geojson: z.string().optional(),
});

type MintingFormValues = z.infer<typeof HypercertMintSchema>;

const HypercertForm = () => {
	const imageRef = useRef<HTMLDivElement | null>(null);
	const [badges, setBadges] = useState<string[]>([]);
	const [openMintDialog, setOpenMintDialog] = useState(false);
	const [geoJSONFile, setGeoJSONFile] = useState<File | null>(null);
	const {
		mintHypercert,
		mintStatus,
		mintData,
		mintError,
		isReceiptLoading,
		isReceiptSuccess,
		isReceiptError,
		receiptData,
		receiptError,
		googleSheetsStatus,
		googleSheetsError,
	} = useMintHypercert();

	const form = useForm<MintingFormValues>({
		resolver: zodResolver(HypercertMintSchema),
		defaultValues: {
			title: "",
			banner:
				"https://pub-c2c1d9230f0b4abb9b0d2d95e06fd4ef.r2.dev/sites/93/2019/05/My-Post-9-1600x900.png",
			description: "",
			logo: "https://pbs.twimg.com/profile_images/1674865118914437130/9HjAHrYf_400x400.jpg",
			link: "",
			tags: "",
			projectDates: [undefined, undefined],
			contact: "",
			acceptTerms: false,
			confirmContributorsPermission: false,
			geojson: "",
		},
		mode: "onChange",
	});

	const tags = form.watch("tags") || "";
	useEffect(() => {
		if (tags) {
			const tagArray = tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag !== "");
			setBadges([...tagArray]);
		} else {
			setBadges([]);
		}
	}, [tags]);

	const generateImage = async () => {
		if (imageRef.current === null) {
			return;
		}
		const dataUrl = await toPng(imageRef.current, {
			cacheBust: true,
			fetchRequestInit: { mode: "cors" },
		});
		return dataUrl;
	};

	const onSubmit = useCallback(
		async (values: MintingFormValues) => {
			const image = await generateImage();
			if (!image) {
				console.error("Failed to generate image");
				return;
			}

			let geoJSONData = null;
			if (values.geojson) {
				try {
					const response = await fetch(values.geojson);
					geoJSONData = await response.json();
				} catch (error) {
					console.error("Error fetching GeoJSON:", error);
				}
			} else if (geoJSONFile) {
				try {
					const text = await geoJSONFile.text();
					geoJSONData = JSON.parse(text);
				} catch (error) {
					console.error("Error parsing GeoJSON file:", error);
				}
			}

			const metadata: HypercertMetadata = {
				name: values.title,
				description: values.description,
				image: image,
				external_url: values.link,
			};

			const formattedMetadata = formatHypercertData({
				...metadata,
				version: "2.0",
				properties: [
					{
						trait_type: "GeoJSON",
						data: geoJSONData,
					},
				],
				impactScope: ["all"],
				excludedImpactScope: [],
				workScope: badges,
				excludedWorkScope: [],
				rights: ["Public Display"],
				excludedRights: [],
				workTimeframeStart:
					(values.projectDates[0] ?? new Date()).getTime() / 1000,
				workTimeframeEnd:
					(values.projectDates[1] ?? new Date()).getTime() / 1000,
				impactTimeframeStart:
					(values.projectDates[0] ?? new Date()).getTime() / 1000,
				impactTimeframeEnd:
					(values.projectDates[1] ?? new Date()).getTime() / 1000,
				contributors: values.contributors.split(", ").filter(Boolean),
			});

			if (!formattedMetadata.valid || !formattedMetadata.data) {
				console.log("Invalid metadata");
				return;
			}

			console.log("formattedMetadata", formattedMetadata);

			mintHypercert({
				metaData: formattedMetadata.data,
				contactInfo: values.contact,
				amount: "1",
			});
			setOpenMintDialog(true);
		},
		[badges, mintHypercert, generateImage, geoJSONFile],
	);

	return (
		<Dialog open={openMintDialog} onOpenChange={setOpenMintDialog}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="mb-10 flex flex-col-reverse gap-6 md:mb-0 md:flex-row md:gap-4">
						<Card className="relative overflow-hidden rounded-3xl bg-white/50 py-4 shadow-none">
							<div className="-top-10 -right-10 absolute h-40 w-40 rounded-full bg-primary/30 blur-2xl" />
							<div className="-bottom-10 -left-10 absolute h-40 w-40 rounded-full bg-beige-muted-foreground/30 blur-2xl" />
							<CardContent className="flex scale-100 flex-col gap-6 p-0 px-4">
								<section className="flex flex-col gap-2">
									<h2 className="font-baskerville font-bold text-2xl">
										General Fields
									</h2>
									<div className="flex flex-col gap-4 rounded-2xl bg-background p-4">
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Hypercert Name</FormLabel>
													<FormControl>
														<Input placeholder="Hypercert Title" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="logo"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Logo Image</FormLabel>
													<FormControl>
														<Input
															placeholder="https://i.imgur.com/hypercert-logo.png"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="banner"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Background Banner Image</FormLabel>
													<FormControl>
														<Input
															placeholder="https://i.imgur.com/hypercert-banner.png"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description</FormLabel>
													<FormControl>
														<Textarea
															className="bg-inherit"
															placeholder="Hypercert description"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="link"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Link</FormLabel>
													<FormControl>
														<Input
															placeholder="https://hypercerts.org"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</section>
								<section className="flex flex-col gap-2">
									<h2 className="font-baskerville font-bold text-2xl">
										Hypercert Fields
									</h2>

									<div className="flex flex-col gap-4 rounded-2xl bg-background p-4">
										<FormField
											control={form.control}
											name="tags"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Work Scope</FormLabel>
													<FormControl>
														<Textarea
															className="bg-inherit"
															placeholder="Hypercerts, Impact, ..."
															{...field}
														/>
													</FormControl>
													<FormMessage />
													<div className="flex flex-wrap gap-0.5">
														{badges.map((tag, index) => (
															<Badge
																key={`${tag}-${
																	// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
																	index
																}`}
																variant="secondary"
															>
																{tag}
															</Badge>
														))}
													</div>
												</FormItem>
											)}
										/>

										<div className="flex flex-col gap-2 md:flex-row">
											<FormField
												control={form.control}
												name="projectDates"
												render={({ field }) => (
													<FormItem className="flex w-full flex-col">
														<FormLabel>Project Dates</FormLabel>
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		id="date"
																		variant={"outline"}
																		className={cn(
																			"w-full justify-start text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}
																	>
																		<CalendarIcon className="mr-2 h-4 w-4" />
																		{field.value[0] && field.value[1] ? (
																			<>
																				{format(field.value[0], "LLL dd, y")} -{" "}
																				{format(field.value[1], "LLL dd, y")}
																			</>
																		) : (
																			<span>Pick a date range</span>
																		)}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	initialFocus
																	mode="range"
																	defaultMonth={field.value?.[0]}
																	selected={{
																		from: field.value?.[0],
																		to: field.value?.[1],
																	}}
																	onSelect={(range) => {
																		console.log(range, field);
																		field.onChange([range?.from, range?.to]);
																		// field.onChange({
																		//   workStartDate: range?.from,
																		//   workEndDate: range?.to,
																		// });
																		console.log(field.value);
																	}}
																	numberOfMonths={2}
																/>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										{/* <div className="flex flex-col gap-2 md:flex-row">
                      <FormField
                        control={form.control}
                        name="projectDates.workStartDate"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col">
                            <FormLabel>Work Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full rounded-sm border-input pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>

                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date >
                                    form.watch("projectDates.workEndDate")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectDates.workEndDate"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col">
                            <FormLabel>Work End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full rounded-sm border-input pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <
                                    form.watch("projectDates.workStartDate")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div> */}
										<FormField
											control={form.control}
											name="contributors"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														List of Contributors to the Work
													</FormLabel>
													<FormControl>
														<Textarea
															className="bg-inherit"
															placeholder="0xWalletAddress1, 0xWalletAddress2, ..."
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="geojson"
											render={({ field }) => (
												<FormItem>
													<FormLabel>GeoJSON (URL or File)</FormLabel>
													<FormControl>
														<div className="flex gap-2">
															<Input
																type="text"
																placeholder="https://example.com/data.geojson"
																{...field}
																onChange={(e) => {
																	field.onChange(e.target.value);
																	setGeoJSONFile(null);
																}}
															/>
															<Input
																type="file"
																accept=".geojson,application/geo+json"
																onChange={(e) => {
																	const file = e.target.files?.[0];
																	if (file) {
																		setGeoJSONFile(file);
																		field.onChange("");
																	}
																}}
															/>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</section>
								<section className="flex flex-col gap-2">
									<h2 className="font-baskerville font-bold text-2xl">
										Contact Information
									</h2>
									<div className="flex flex-col gap-4 rounded-2xl bg-background p-4">
										<FormField
											control={form.control}
											name="contact"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Telegram / Email</FormLabel>
													<FormControl>
														<Input placeholder="@Hypercerts" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="confirmContributorsPermission"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
													<FormControl>
														<Checkbox
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
													<div className="space-y-1 leading-none">
														<FormLabel>
															I confirm that all listed contributors gave their
															permission to include their work in this
															hypercert.
														</FormLabel>
													</div>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="acceptTerms"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
													<FormControl>
														<Checkbox
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
													<div className="space-y-1 leading-none">
														<FormLabel>
															I agree to the{" "}
															<a
																href="https://hypercerts.org/terms/"
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-600"
															>
																Terms & Conditions
															</a>
														</FormLabel>
													</div>
												</FormItem>
											)}
										/>
									</div>
								</section>
								<div className="flex items-center justify-center">
									<div className="relative mt-2 inline-flex flex-col items-center gap-2 self-start rounded-lg border border-orange-500/50 bg-orange-100/50 px-4 py-2 md:flex-row dark:bg-orange-950/50">
										<TriangleAlert
											className="mr-2 hidden text-orange-600 md:block dark:text-orange-300"
											size={16}
										/>
										<div className="-top-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background md:hidden">
											<TriangleAlert
												className="text-orange-600 dark:text-orange-300"
												size={18}
											/>
										</div>
										<span className="text-balance text-center text-orange-800 text-sm dark:text-orange-200">
											All information will be publicly available and can not be
											changed afterwards.
										</span>
									</div>
								</div>
								<div className="flex w-full items-center justify-end gap-2">
									<Button type="submit" className="gap-2">
										Submit <ArrowRight size={16} />
									</Button>
								</div>
							</CardContent>
						</Card>
						<div className="flex w-full justify-center rounded-3xl bg-beige-muted p-8 md:block md:w-auto md:justify-start md:bg-transparent md:p-0">
							<HypercertCard
								title={form.watch("title") || undefined}
								description={form.watch("description") || undefined}
								banner={form.watch("banner") || undefined}
								logo={form.watch("logo") || undefined}
								workStartDate={form.watch("projectDates.0")}
								workEndDate={form.watch("projectDates.1")}
								badges={badges}
								displayOnly={true}
								contributors={
									form.watch("contributors")?.split(", ").filter(Boolean) || []
								}
								ref={imageRef}
							/>
						</div>
					</div>
				</form>
			</Form>
			<HypercertMintDialog
				mintStatus={mintStatus}
				mintData={mintData}
				mintError={mintError}
				isReceiptLoading={isReceiptLoading}
				isReceiptSuccess={isReceiptSuccess}
				isReceiptError={isReceiptError}
				receiptError={receiptError}
				receiptData={receiptData}
				googleSheetsStatus={googleSheetsStatus}
				googleSheetsError={googleSheetsError}
				setOpenMintDialog={setOpenMintDialog}
			/>
		</Dialog>
	);
};

export { HypercertForm };
