precision mediump float;

uniform vec2 uCameraPosition;
uniform vec2 uCameraSize;

attribute vec2 aPosition;
varying vec2 vPosition;
attribute float aGrad;
varying float vGrad;

void main() {
	// Fix camera size
	vec2 pos = 2. * (aPosition - uCameraPosition) / uCameraSize;
	gl_Position = vec4(pos, 0, 1);

	vPosition = aPosition;
	vGrad = aGrad;
}