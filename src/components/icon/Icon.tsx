import { toClassName } from "@components/utils.tsx";
import { FC } from "react";
import css from "./Icon.module.css";
import { IconName, getCustomColorIconUrl, getCustomMaskIconUrl } from "./icons.ts";

type IconProps = {
	icon: IconName;
	size?: number;
	title?: string;
	classList?: string | string[];
};
export const Icon: FC<IconProps> = ({
	icon, size, title, classList,
}) => {
	const customColorIconUrl = getCustomColorIconUrl(icon);
	if (customColorIconUrl) {
		const className = toClassName(
			css["custom-color-icon"],
			classList,
		);
		const style = {
			"--size": size,
			"--icon": `url("${customColorIconUrl}")`,
		};
		return (
			<span role="img" {...{ className, title, style }} />
		);
	}
	const customMaskIconUrl = getCustomMaskIconUrl(icon);
	if (customMaskIconUrl) {
		const className = toClassName(
			css["custom-mask-icon"],
			classList,
		);
		const style = {
			"--size": size,
			"--icon": `url("${customMaskIconUrl}")`,
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