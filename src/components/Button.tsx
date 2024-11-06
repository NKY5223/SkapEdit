import "./Button.css";

export type ButtonType = "primary" | "secondary" | "confirm" | "deny";

export function Button({ children, disabled, type, onClick }: React.PropsWithChildren<
	{ disabled?: boolean, type?: ButtonType, onClick?: React.MouseEventHandler<HTMLButtonElement> }
>) {
	const className = type ? `button ${type}` : "button";
	return <button className={className} disabled={disabled} onClick={onClick}>
		{children}
	</button>;
}