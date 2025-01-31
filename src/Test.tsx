import { Viewport } from "./components/renderer/Viewport.tsx";
import { TestWebGLRenderer } from "./components/renderer/webgl/test.ts";

// setTheme(dark);
export function Test() {
	return <div className="test">
		{/* <AreaSplit axis="y" split={0.3}>
			<div><h1>Buttons</h1>
				<Button>default</Button>
				<Button type="primary">primary</Button>
				<Button type="secondary">secondary</Button>
				<Button type="confirm">confirm</Button>
				<Button type="deny">deny</Button></div>
			<div><h2>Disabled</h2>
				<Button disabled>default</Button>
				<Button disabled type="primary">primary</Button>
				<Button disabled type="secondary">secondary</Button>
				<Button disabled type="confirm">confirm</Button>
				<Button disabled type="deny">deny</Button></div>
		</AreaSplit> */}
		<Viewport renderers={[
			new TestWebGLRenderer(10)
		]} />
	</div>;
}