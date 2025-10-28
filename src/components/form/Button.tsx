import { PropsWithChildren } from "react";
import { Icon } from "../icon/Icon.tsx";
import { IconName } from "@components/icon/icons.ts";
import { toClassName, ExtensibleFC } from "../utils.tsx";
import css from "./Button.module.css";

export type ButtonType = "primary" | "secondary" | "confirm" | "deny";

type ButtonProps = PropsWithChildren<{
	type?: ButtonType;
	id?: string;
	icon?: IconName;
	iconTitle?: string;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}>;
export const Button: ExtensibleFC<ButtonProps> = ({
	type, id,
	icon, iconTitle: title, disabled, children,
	onClick,

	classList: classes = [],
}) => {
	const className = toClassName(
		css["button"], 
		type && css[type], 
		icon && css["has-icon"], 
		...classes,
	);
	return <button id={id} className={className} disabled={disabled} 
		onClick={onClick} onContextMenu={e => e.stopPropagation()}
	>
		{icon && (<div className={css["icon"]}>
			<Icon
				icon={icon}
				size={1.5}
				title={title}
			/>
		</div>)}
		<div className={css.content}>
			{children}
		</div>
	</button>;
}