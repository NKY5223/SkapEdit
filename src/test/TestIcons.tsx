import { useIcons, Icon } from "../components/icon/Icon.tsx";
import { ViewFC } from "../components/layout/LayoutView.tsx";
import { unique, reverseMap } from "../common/array.ts";

export const TestIcons: ViewFC = ({ children }) => {
	const entries = [...useIcons()];
	const allIcons = unique(entries, ([, { id: a }], [, { id: b }]) => a === b);
	const reverse = reverseMap(entries.map(([k, { canonicalName }]) => [k, canonicalName]));

	const iconAttrs = {
		color: "var(--theme-foreground-0)",
	};
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				gap: ".5em",
			}}
		>
			{children}
			{allIcons.map(([icon]) => (<Icon
				key={icon}
				title={(reverse.get(icon) ?? ["err"]).join(" | ")}
				icon={icon}
				width="1.5em"
				height="1.5em"
				vars={{
					...iconAttrs,
					"guide-opacity": 0,
				}} />))}
		</div>
	);
};
