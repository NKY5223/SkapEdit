import { FC } from "react";
import "./Icon.module.css";
import { IconName } from "./IconName.ts";
import { toClassName } from "@components/utils.tsx";

type IconProps = {
	icon: IconName;
	size?: number;
	title?: string;
	classList?: string[];
};
export const Icon: FC<IconProps> = ({
	icon, size: height = 1.5, title, classList: extraClasses = [],
}) => {
	const className = toClassName(
		"material-symbols-outlined",
		...extraClasses,
	);
	return (
		<span role="img" className={className} style={{ "--size": height }} title={title}>{icon}</span>
	);
}