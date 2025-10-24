import { toClassName } from "@components/utils.tsx";
import { FC } from "react";
import "./Icon.css";
import { IconName } from "./IconName.ts";

type IconProps = {
	icon: IconName;
	size?: number;
	title?: string;
	classList?: string[];
};
export const Icon: FC<IconProps> = ({
	icon, size, title, classList,
}) => {
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