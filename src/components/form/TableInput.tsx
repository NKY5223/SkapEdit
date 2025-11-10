import { FC, Fragment, ReactNode, SetStateAction, useState } from "react";
import css from "./TableInput.module.css";
import { Button } from "./Button.tsx";
import { toClassName } from "@components/utils.tsx";
import { Icon } from "@components/icon/Icon.tsx";

type TableInputProps<T> = {
	values: T[];
	/**
	 * This will be used for the expanded view of items.
	 */
	details: (value: T, index: number) => ReactNode;
	/** 
	 * A function that returns `columns` nodes.
	 * This will be used for the collapsed view of items.
	 */
	summary: (value: T) => ReactNode[];
	/** 
	 * An array of `columns` nodes.
	 * This will be used for the header of the table.
	 */
	header: ReactNode[];
	addItem?: () => void;
	removeItem?: (index: number) => void;
};
export const TableInput = <T,>({
	values,
	details, summary, header,
	addItem, removeItem,
}: TableInputProps<T>): ReactNode => {
	const [openIndex, setOpenIndexInternal] = useState<number | null>(null);
	const columnCount = header.length;

	const setOpenIndex = (action: SetStateAction<number | null>) => {
		console.log(action);
		setOpenIndexInternal(action);
	}

	const rows = values.map((v, i) => (<Fragment key={i}>
		<tr className={toClassName(
			css["summary-row"],
			openIndex === i && css["active"],
		)} tabIndex={0} onFocus={() => setOpenIndex(i)}>
			{summary(v).map((node, j) => (
				<td key={j} className={css["summary-cell"]}>{node}</td>
			))}
		</tr>
		{openIndex === i &&
			<tr className={css["details-row"]}>
				<td colSpan={columnCount} className={css["details-cell"]}>
					<div className={css["details-content"]}>
						<div>
							{details(v, i)}
						</div>
						{removeItem && (
							<Button type="negative" classList={css["remove"]} icon="close"
								onClick={() => {
									removeItem(i);
									setOpenIndex(null);
								}}
							/>
						)}
					</div>
				</td>
			</tr>
		}
	</Fragment>));

	return (
		<table className={css["table"]}>
			<thead>
				<tr>
					{header.map((node, i) => (
						<th key={i}>{node}</th>
					))}
				</tr>
			</thead>
			<tbody>{rows}</tbody>
			{addItem && (
				<tfoot>
					<tr>
						<td colSpan={columnCount} className={css["add-cell"]}>
							<Button classList={css["add"]} icon="add"
								onClick={() => {
									addItem();
								}}
							/>
						</td>
					</tr>
				</tfoot>
			)}
		</table>
	);
}