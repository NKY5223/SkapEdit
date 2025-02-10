import "./theme.css";

type ThemeProviderProps = {
	theme?: Record<string, string>;
};

export function ThemeProvider({
	children,
	theme
}: React.PropsWithChildren<ThemeProviderProps>) {
	return (
		<div style={theme}>
			{children}
		</div>	
	);
}