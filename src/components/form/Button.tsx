import css from "./Button.module.css";

export type ButtonType = "primary" | "secondary" | "confirm" | "deny";

type ButtonProps = {
	type?: ButtonType;
	icon?: string;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function Button({ 
	type, icon, disabled, children, 
	onClick 
}: React.PropsWithChildren<ButtonProps>) {
	const className = [css.button, type && css[type], icon && css.icon].filter(x => !!x).join(" ");
	return <button className={className} disabled={disabled} onClick={onClick}>
		{children}
	</button>;
}