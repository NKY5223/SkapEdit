/** Should really be all info about the viewport */
export type ViewportBounds = {
	x: number;
	y: number;
	width: number;
	height: number;
	scale: number;
}
export interface ViewportLayer<T = unknown, L = unknown> {
	element: HTMLElement;
	zIndex: number;
	ready: boolean;

	canInitWith(layer: unknown): layer is L;
	/**
	 * @param layer If needed, copy data from this
	 */
	init(layer?: L): void;
	canRender(thing: unknown): thing is T;
	render(viewport: ViewportBounds, things: T[]): void;
}