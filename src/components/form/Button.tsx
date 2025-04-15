import { PropsWithChildren } from "react";
import { Icon, IconName } from "../icon/Icon.tsx";
import { classList, ExtensibleFC } from "../utils.tsx";
import css from "./Button.module.css";

export type ButtonType = "primary" | "secondary" | "confirm" | "deny";

type ButtonProps = PropsWithChildren<{
	type?: ButtonType;
	icon?: IconName;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}>;
export const Button: ExtensibleFC<ButtonProps> = ({
	type, icon, disabled, children,
	onClick,

	classes = [],
}) => {
	const className = classList(
		css["button"], 
		type && css[type], 
		icon && css["has-icon"], 
		...classes,
	);
	return <button className={className} disabled={disabled} onClick={onClick} onContextMenu={e => e.stopPropagation()}>
		{icon && (<div className={css["icon"]}>
			<Icon
				icon={icon}
				height={1.5}
			/>
		</div>)}
		<div className={css.content}>
			{children}
		</div>
	</button>;
}