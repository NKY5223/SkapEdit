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
	header?: ReactNode[];
	addItem?: () => void;
	removeItem?: (index: number) => void;
};
export const TableInput = <T,>({
	values,
	details, summary, header,
	addItem, removeItem,
}: TableInputProps<T>): ReactNode => {
	const columnCount = (header?.length
		?? (values.length > 0 ? summary(values[0]).length : undefined)
		?? 1);

	const rows = values.map((v, i) => (
		// Can't use <details> because it has weird display behaviour
		<Details key={i}>
			<>
				<div className={css["arrow"]}></div>
				{summary(v).map((node, j) => (
					<div key={j}>{node}</div>
				))}
				{removeItem && (
					<Button classList={css["remove"]} icon="remove"
						onClick={() => {
							removeItem(i);
						}}
					/>
				)}
			</>
			<>
				{details(v, i)}
			</>
		</Details>
	));

	return (
		<div className={css["table"]} style={{
			"--columns": columnCount,
		}}>
			{header &&
				<div className={css["header"]}>
					{header.map((node, i) => (
						<div key={i} className={css["cell"]}>{node}</div>
					))}
				</div>
			}
			{rows}
			{addItem && (
				<div className={css["add-cell"]}>
					<Button classList={css["add"]} icon="add"
						onClick={() => {
							addItem();
						}}
					/>
				</div>
			)}
		</div>
	);
}

const Details: FC<{ children: [summary: ReactNode, content: ReactNode]; }> = ({
	children: [summary, content]
}) => {
	const [open, setOpen] = useState(false);
	const className = toClassName(
		css["details"],
		open && css["open"],
	);
	const toggle = () => {
		setOpen(o => !o);
	};
	return (
		<div className={className}>
			<div className={css["summary"]} tabIndex={0}
				onClick={toggle}
				onKeyDown={e => {
					if (e.code === "Space" || e.code === "Enter") toggle();
				}}
			>{summary}</div>
			<div className={css["details-content"]}>{content}</div>
		</div>
	);
}