import { Dispatch, FC, PropsWithChildren } from "react";
import { Option } from "@components/form/dropdown/Dropdown.ts";
import { OptionSection } from "../form/dropdown/Dropdown.ts";
import { Translate } from "../translate/Translate.tsx";
import { Layout, LayoutAction, useViewProviders } from "./layout.ts";
import css from "./LayoutViewToolbar.module.css";
import { Button } from "../form/Button.tsx";
import { toClassName, ExtensibleFC } from "../utils.tsx";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { makeView } from "./layout.ts";


type ViewSelectorProps = {
	view: Layout.ViewNode;
	dispatchLayout: Dispatch<LayoutAction>;
};
export const ViewSelector: FC<ViewSelectorProps> = ({
	view, dispatchLayout
}) => {
	const views = useViewProviders();

	type T = Layout.ViewProvider;
	// Holy confusing
	const options: OptionSection<T>[] = Object.entries(Object.groupBy<string, Option<Layout.ViewProvider>>(
		views.entries().map(([name, provider]) => {
			const { icon } = provider;
			return {
				value: provider,
				label: (current) => current && icon
					? (<></>)
					: (<Translate k="layout.view.name" view={name} />),
				icon: icon && (() => icon),
				name,
			} satisfies Option<Layout.ViewProvider>;
		}), ({ name }) => name.split(".")[0]
	)).map<OptionSection<Layout.ViewProvider>>(([name, options]) => ({
		name,
		label: <Translate k="layout.view.category.name" category={name} />,
		options: options ?? [],
	}));
	const initial = views.values().find(provider => provider.name === view.providerName);

	return (
		<div className={css["selector"]}>
			<DropdownSelect initialValue={initial} options={options}
				fallbackLabel={<Translate k="layout.view.fallback" />}
				fallbackIcon="indeterminate_question_box"
				optionsClassList={[css["selector-options"]]}
				onSelect={value => value && dispatchLayout({
					type: "replace",
					targetNode: view.id,
					replacement: makeView(value)
				})}
			/>
		</div>
	);
}
/** Essentially a div */
export const ViewToolbar: ExtensibleFC<PropsWithChildren> = ({ children, classList: classes }) => (
	<div className={toClassName(css["toolbar"], ...classes ?? [])}>{children}</div>
);
export const ViewToolbarButton: typeof Button = ({ ...props }) => (
	<Button {...props} classList={[...props.classList ?? [], css["button"]]}></Button>
);