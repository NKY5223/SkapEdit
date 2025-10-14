import { FC } from "react";
import "./Icon.module.css";
import { IconName } from "./IconName.ts";

type IconProps = {
	icon: IconName;
	size?: number;
	title?: string;
};
export const Icon: FC<IconProps> = ({
	icon, size: height = 1.5, title
}) => {
	return (
		<span role="img" className="material-symbols-outlined" style={{ "--size": height }} title={title}>{icon}</span>
	);
}