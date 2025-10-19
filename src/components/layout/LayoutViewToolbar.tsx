import { Dispatch, FC, PropsWithChildren } from "react";
import { Option } from "@components/form/dropdown/Dropdown.ts";
import { SectionedOptions, DropdownSelectSectioned } from "../form/dropdown/DropdownSelectSectioned.tsx";
import { Translate } from "../translate/Translate.tsx";
import { Layout, LayoutAction, useViewProviders } from "./Layout.tsx";
import css from "./LayoutViewToolbar.module.css";
import { Button } from "../form/Button.tsx";
import { toClassName, ExtensibleFC } from "../utils.tsx";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";


type ViewSelectorProps = {
	view: Layout.NodeView;
	dispatch: Dispatch<LayoutAction>;
};
export const ViewSelector: FC<ViewSelectorProps> = ({
	view, dispatch
}) => {
	const views = useViewProviders();

	const options = Object.entries(Object.groupBy<string, Option<string>>(
		views.entries().map(([name, { icon }]) => (
			{
				value: name,
				label: (current) => current && icon
					? (<></>)
					: (<Translate k="layout.view.name" view={name} />),
				icon: icon && (() => icon),
				name,
			} satisfies Option<string>
		)), ({ name }) => name.split(".")[0]
	)).map<SectionedOptions<string>[number]>(([name, options]) => ({
		name,
		label: <Translate k="layout.view.category.name" category={name} />,
		options: options ?? [],
	})) satisfies SectionedOptions<string>;

	return (
		<div className={css["selector"]}>
			<DropdownSelect initialValue={view.providerName} options={options}
				fallbackLabel={<Translate k="layout.view.fallback" />}
				fallbackIcon="indeterminate_question_box"
				optionsClassList={[css["selector-options"]]}
				onSelect={value => dispatch({
					type: "set_view",
					targetNode: view.id,
					providerName: value,
				})}
			/>
		</div>
	);
}
/** Essentially a div */
export const ViewToolbar: ExtensibleFC<PropsWithChildren> = ({ children, classes }) => (
	<div className={toClassName(css["toolbar"], ...classes ?? [])}>{children}</div>
);
export const ViewToolbarButton: typeof Button = ({ ...props }) => (
	<Button {...props} classes={[...props.classes ?? [], css["button"]]}></Button>
);