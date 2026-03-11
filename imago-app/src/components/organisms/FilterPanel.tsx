import type { FacetsResponse } from '@/api/generated/server.client';
import { CreditSelector } from '@/components/molecules/CreditSelector';
import { DatePicker } from '@/components/molecules/DatePicker';
import { RestrictionSelector } from '@/components/molecules/RestrictionSelector';
import { cn } from '@/utils/helpers/cn';

export interface FilterValues {
	credit?: string;
	dateFrom?: string;
	dateTo?: string;
	restrictions: string[];
}

interface FilterPanelProps {
	facets: FacetsResponse;
	values: FilterValues;
	onChange: (values: FilterValues) => void;
	className?: string;
}

export const FilterPanel = ({ facets, values, onChange, className }: FilterPanelProps) => {
	const toggleRestriction = (code: string) => {
		const current = values.restrictions;
		const next = current.includes(code) ? current.filter((r) => r !== code) : [...current, code];
		onChange({ ...values, restrictions: next });
	};

	return (
		<div className={cn('flex flex-wrap items-end gap-4', className)}>
			<div className="flex min-w-45 flex-col gap-2">
				<CreditSelector
					credits={facets.credits}
					value={values.credit ?? null}
					onChange={(v) => onChange({ ...values, credit: v ?? undefined })}
				/>
			</div>

			<div className="flex min-w-35 flex-col gap-2">
				<DatePicker
					label="Date from"
					value={values.dateFrom}
					min={facets.dateRange.min}
					max={values.dateTo || facets.dateRange.max}
					onChange={(v) => onChange({ ...values, dateFrom: v })}
					ariaLabel="Filter from date"
				/>
			</div>

			<div className="flex min-w-35 flex-col gap-2">
				<DatePicker
					label="Date to"
					value={values.dateTo}
					min={values.dateFrom || facets.dateRange.min}
					max={facets.dateRange.max}
					onChange={(v) => onChange({ ...values, dateTo: v })}
					ariaLabel="Filter to date"
				/>
			</div>

			<div className="flex w-full flex-col gap-2">
				<RestrictionSelector
					restrictions={facets.restrictions}
					selected={values.restrictions}
					onToggle={toggleRestriction}
				/>
			</div>
		</div>
	);
};
