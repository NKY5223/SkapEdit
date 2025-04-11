import { classList } from "@components/utils.tsx";
import { createMapContext } from "@hooks/createMapContext.tsx";
import { FC, ReactNode } from "react";

export type IconInfo = {
	/** Contents of the `<svg>` */
	content: ReactNode;
	aspectRatio?: number;
};
const [useIcons, useIcon, IconProvider] = createMapContext<IconInfo>();
export { useIcons, useIcon, IconProvider }

declare global {
	namespace Registry {
		interface Icon {
		}
	}
}
/**
 * Add autocompletion with
 * ```ts
 * declare global {
 * 	namespace Registry {
 * 		interface Icon {
 * 			// key: "whatever"
 * 		}
 * 	}
 * }
 * ```
 */
export type IconName = keyof Registry.Icon | string & {};

type NewIconProps = {
	icon: IconName;
	/** Size, in `em` */
	height?: number;
	classList?: (string | false | null | undefined)[];
	color?: string;
};
export const NewIcon: FC<NewIconProps> = ({
	icon,
	height = 1.5,
	classList: classes = [],
	color = "currentColor",
}) => {
	const info = useIcon(icon);
	const className = classList(
		...classes,
	);
	if (info === undefined) {
		const size = `${height}em`;
		return (
			<svg
				width={size} height={size} viewBox="0 0 24 24"
				className={className}
			>
				<title>{icon} @ {height}</title>
				<text
					x={12} y={19}
					textAnchor="middle"
					fill={color} fontSize="20"
				>?</text>
				<path
					fill={color} stroke="none"
					d="M0 0 h24 v24 h-24 v-24 l2 2 v20 h20 v-20 h-20 Z"
				/>
			</svg>
		);
	}
	const {
		content,
		aspectRatio = 1,
	} = info;
	const w = `${height * aspectRatio}em`;
	const h = `${height}em`;
	return (
		<svg
			width={w} height={h} viewBox="0 0 24 24"
			className={className} 
			fill={color}
		>
			<title>{icon} @ {height}</title>
			{content}
		</svg>
	);
}