import { Dispatch, FC, PropsWithChildren, Ref } from "react";
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

	type T = string;
	// Holy confusing
	const options: OptionSection<T>[] = Object.entries(Object.groupBy<string, Option<T>>(
		views.entries().map(([name, provider]) => {
			const { icon } = provider;
			return {
				value: name,
				label: (current) => current && icon
					? (<></>)
					: (<Translate k="layout.view.name" view={name} />),
				icon: icon && (() => icon),
				name,
			} satisfies Option<T>;
		}), ({ name }) => name.split(".")[0]
	)).map<OptionSection<T>>(([name, options]) => ({
		name,
		label: <Translate k="layout.view.category.name" category={name} />,
		options: options ?? [],
	}));

	return (
		<div className={css["selector"]}>
			<DropdownSelect value={view.providerName} options={options}
				fallbackLabel={<Translate k="layout.view.fallback" />}
				fallbackIcon="indeterminate_question_box"
				optionsClassList={[css["selector-options"]]}
				onInput={name => {
					const provider = views.get(name);
					if (!provider) return;
					dispatchLayout({
						type: "replace",
						targetNode: view.id,
						replacement: makeView(provider)
					});
				}}
			/>
		</div>
	);
}
/** Essentially a div */
export const ViewToolbar: ExtensibleFC<PropsWithChildren<{ ref?: Ref<HTMLDivElement> }>> = ({ ref, children, classList }) => (
	<div ref={ref} className={toClassName(css["toolbar"], ...classList ?? [])}>{children}</div>
);
export const ViewToolbarButton: typeof Button = ({ ...props }) => (
	<Button {...props} classList={[...props.classList ?? [], css["button"]]}></Button>
);