import { CardinalDirection } from "@editor/object/Base.tsx";
import { FC } from "react";
import { makeOption } from "./dropdown/Dropdown.ts";
import { DropdownSelect } from "./dropdown/DropdownSelect.tsx";
import { Translate } from "@components/translate/Translate.tsx";

type CardinalDirectionInputProps = {
	value: CardinalDirection;
	onInput: (value: CardinalDirection) => void;
};
export const CardinalDirectionInput: FC<CardinalDirectionInputProps> = ({
	value, onInput,
}) => {
	return (
		<DropdownSelect initialValue={value}
			options={[
				makeOption("down", CardinalDirection.Down, <Translate k="generic.direction.down" />),
				makeOption("left", CardinalDirection.Left, <Translate k="generic.direction.left" />),
				makeOption("up", CardinalDirection.Up, <Translate k="generic.direction.up" />),
				makeOption("right", CardinalDirection.Right, <Translate k="generic.direction.right" />),
			]}
			onSelect={onInput}
		/>
	)
}