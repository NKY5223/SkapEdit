import { toClassName } from "@components/utils.tsx";
import { FC } from "react";
import css from "./Icon.module.css";
import { IconName, getCustomIconUrl } from "./icons.ts";

type IconProps = {
	icon: IconName;
	size?: number;
	title?: string;
	classList?: string[];
};
export const Icon: FC<IconProps> = ({
	icon, size, title, classList,
}) => {
	const customIconUrl = getCustomIconUrl(icon);
	if (customIconUrl) {
		const className = toClassName(
			css["custom-icon"],
			classList,
		);
		const style = {
			"--size": size,
			"--icon": `url("${customIconUrl}")`,
		};
		return (
			<span role="img" {...{ className, title, style }} />
		);
	}
	const className = toClassName(
		"material-symbols-outlined",
		classList,
	);
	// terribly inaccessible but cannot deal with it rn
	return (
		<span role="img" {...{ className, title }} style={{ "--size": size }}>
			{icon}
		</span>
	);
}