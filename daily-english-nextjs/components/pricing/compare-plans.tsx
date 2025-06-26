import { PlansRow } from "@/types/subscription";
import { CircleCheck, Info } from "lucide-react";

import { comparePlans, plansColumns } from "@/config/subscriptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function ComparePlans() {
  const renderCell = (value: string | boolean | null) => {
    if (value === null) return "—";
    if (typeof value === "boolean")
      return value ? <CircleCheck className="mx-auto size-[22px]" /> : "—";
    return value;
  };

  return (
    <MaxWidthWrapper>
      <HeaderSection
        label="Plans"
        title="Compare Our Plans"
        subtitle="Find the perfect plan tailored for your business needs!"
      />

      <div className="my-10 overflow-x-scroll max-lg:mx-[-0.8rem] md:overflow-x-visible">
        <table className="w-full table-fixed backdrop-blur-lg bg-white/10 rounded-2xl overflow-hidden border border-white/20">
          <thead>
            <tr className="divide-x divide-white/20 border-b border-white/20">
              <th className="w-40 bg-white/10 backdrop-blur-sm p-5 md:w-1/4"></th>
              {plansColumns.map((col) => (
                <th
                  key={col}
                  className="w-40 bg-white/10 backdrop-blur-sm p-5 font-heading text-xl tracking-wide text-white md:w-auto lg:text-2xl"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20 text-gray-200">
            {comparePlans.map((row: PlansRow, index: number) => (
              <tr key={index} className="divide-x divide-white/20 hover:bg-white/5 transition-colors">
                <td
                  data-tip={row.tooltip ? row.tooltip : ""}
                  className="bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between space-x-2 p-4">
                    <span className="text-[15px] font-medium lg:text-base text-gray-100">
                      {row.feature}
                    </span>
                    {row.tooltip && (
                      <Popover>
                        <PopoverTrigger className="rounded p-1 hover:bg-muted">
                          <Info className="size-[18px] text-gray-400" />
                        </PopoverTrigger>
                        <PopoverContent
                          side="top"
                          className="max-w-80 p-3 text-sm bg-gray-900 border-gray-700 text-gray-200"
                        >
                          {row.tooltip}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </td>
                {plansColumns.map((col) => (
                  <td
                    key={col}
                    className="p-4 text-center text-[15px] text-gray-300 lg:text-base"
                  >
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MaxWidthWrapper>
  );
}
