import { useIcons, Icon } from "../components/icon/Icon.tsx";
import { ViewFC } from "../components/layout/LayoutView.tsx";

export const TestIcons: ViewFC = ({ children }) => {
	const entries = [...useIcons()];
	return (
		<div
			style={{
				display: "grid",
				gridTemplateAreas: "'toolbar' 'icons'",
				height: "100%",
				padding: ".5em",
				gap: ".5em",
			}}
		>
			{children}
			<div style={{
				overflow: "auto",
			}}>
				
				{entries.map(([id]) => (
					<span key={id} style={{
						display: "grid",
						gridTemplateAreas: "'icon name'",
						width: "fit-content",
					}}>
						<Icon
							title={id}
							icon={id}
							height={1.5} />
						{id}
					</span>
				))}
			</div>
		</div>
	);
};
