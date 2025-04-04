import { Dispatch, FC, PropsWithChildren } from "react";
import { Option } from "../form/DropdownSelect.tsx";
import { SectionedOptions, DropdownSelectSectioned } from "../form/DropdownSelectSectioned.tsx";
import { Translate } from "../translate/Translate.tsx";
import { LayoutDescView, LayoutAction, useViews } from "./Layout.tsx";
import css from "./LayoutViewToolbar.module.css";
import { Button } from "../form/Button.tsx";
import { classList, ExtensibleFC } from "../utils.tsx";


type ViewSelectorProps = {
	view: LayoutDescView;
	dispatch: Dispatch<LayoutAction>;
};
export const ViewSelector: FC<ViewSelectorProps> = ({
	view, dispatch
}) => {
	const views = useViews();

	const options = Object.entries(Object.groupBy<string, Option<string>>(
		[...views.keys()].map(name => (
			{
				value: name,
				display: () => <Translate values={{ view: name }}>layout.view.name</Translate>,
				name,
			}
		)), ({ name }) => name.split(".")[0]
	)).map<SectionedOptions<string>[number]>(([name, options]) => ({
		name,
		label: <Translate values={{ category: name }}>layout.view.category.name</Translate>,
		options: options ?? [],
	})) satisfies SectionedOptions<string>;

	return (
		<div className={css["toolbar"]}>
			<DropdownSelectSectioned initial={view.view} options={options}
				fallback={<Translate>layout.view.fallback</Translate>}
				optionsClass={css["selector-options"]}
				onSelect={value => dispatch({
					type: "set_view",
					target: view,
					view: value,
				})}
			/>
		</div>
	);
}
export const ViewToolbar: ExtensibleFC<PropsWithChildren> = ({ children, classes }) => (
	<div className={classList(...classes ?? [])}>{children}</div>
);
export const ViewToolbarButton: typeof Button = ({ ...props }) => (
	<Button {...props} classes={[...props.classes ?? [], css["button"]]}></Button>
);