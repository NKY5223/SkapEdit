import { Icon, IconName } from "../icon/Icon.tsx";
import { classList } from "../utils.tsx";
import css from "./Button.module.css";

export type ButtonType = "primary" | "secondary" | "confirm" | "deny";

type ButtonProps = {
	type?: ButtonType;
	icon?: IconName;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function Button({
	type, icon, disabled, children,
	onClick
}: React.PropsWithChildren<ButtonProps>) {
	const className = classList(css.button, type && css[type], icon && css.icon);
	return <button className={className} disabled={disabled} onClick={onClick}>
		{icon && (<div className={css.icon}>
			<Icon
				icon={icon}
				width="1.5em"
				height="1.5em"
			/>
		</div>)}
		<div className={css.content}>
			{children}
		</div>
	</button>;
}