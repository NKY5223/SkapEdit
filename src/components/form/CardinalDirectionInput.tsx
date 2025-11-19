import { CardinalDirection } from "@editor/object/Base.tsx";
import { FC, ReactNode } from "react";
import { makeOption } from "./dropdown/Dropdown.ts";
import { DropdownSelect } from "./dropdown/DropdownSelect.tsx";
import { Translate } from "@components/translate/Translate.tsx";

type CardinalDirectionInputProps = {
	value: CardinalDirection;
	onInput: (value: CardinalDirection) => void;
	label?: ReactNode;
};
export const CardinalDirectionInput: FC<CardinalDirectionInputProps> = ({
	value, onInput,
	label,
}) => {
	return (
		<DropdownSelect value={value}
			options={[
				makeOption("down", CardinalDirection.Down, <Translate k="generic.direction.down" />),
				makeOption("left", CardinalDirection.Left, <Translate k="generic.direction.left" />),
				makeOption("up", CardinalDirection.Up, <Translate k="generic.direction.up" />),
				makeOption("right", CardinalDirection.Right, <Translate k="generic.direction.right" />),
			]}
			onInput={onInput}
			label={label}
		/>
	)
}