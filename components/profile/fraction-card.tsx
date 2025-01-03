import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  bigintToFormattedDate,
  cn,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import type { FractionMetaData } from "@/types";
import type { Address } from "viem";
import { ListForSaleButton } from "../marketplace/list-for-sale-button";
import type { HistoryData } from "./history";
import { SellFractionsDialog } from "./sell-fractions-dialog";
import { Fraction } from "@/app/graphql-queries/user-fractions";

function HistoryCard({ fraction }: { fraction: Fraction }) {
  const { id, hypercertId, fractionId, name, description, image, work, units } =
    fraction;
  return (
    <Card className={cn("rounded-3xl shadow-none")}>
      <CardHeader className={cn("md:pb-2")}>
        <div className="flex items-center justify-between pb-2">
          <div className="flex gap-2">
            {work.from !== undefined && (
              <time
                className="text-sm text-vd-blue-400"
                dateTime={bigintToFormattedDate(work.from)}
              >
                {bigintToFormattedDate(work.from)}
              </time>
            )}
            <span className="text-sm text-vd-blue-400"> - </span>
            {work.to !== undefined && (
              <time
                className="text-sm text-vd-blue-400"
                dateTime={bigintToFormattedDate(work.to)}
              >
                {bigintToFormattedDate(work.to)}
              </time>
            )}
          </div>
          {/* <data className="mt-0">{formatCurrency(units)}</data> */}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="overflow-hidden">
            <img
              src={image}
              alt={`${name} illustration`}
              className="aspect-[3/2] h-auto w-full rounded-2xl object-cover md:max-h-32"
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <CardTitle>{name}</CardTitle>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 pt-2">
                {work.scope?.map((scope) => (
                  <Badge
                    key={scope}
                    variant="secondary"
                    className={cn("items-center justify-between rounded-3xl")}
                  >
                    <p className="ml-1 font-light text-xs">{scope}</p>
                  </Badge>
                ))}
              </div>
              {/* <SellFractionsDialog owner_address={owner_address} /> */}
              {hypercertId && <ListForSaleButton hypercertId={hypercertId} />}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
        <CardDescription className={cn("pt-4")}>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

HistoryCard.displayName = "HistoryCard";

export { HistoryCard };
