import { useIcons, Icon } from "@components/icon/Icon.tsx";
import { Layout } from "@components/layout/Layout.tsx";

export const TestIcons: Layout.ViewComponent = ({ viewSwitch }) => {
	const entries = useIcons().entries();
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
			{viewSwitch}
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

export const TestIconsVP: Layout.ViewProvider = {
	name: "test.icons",
	Component: TestIcons,
};