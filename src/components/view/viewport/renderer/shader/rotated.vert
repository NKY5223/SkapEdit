precision mediump float;

uniform vec2 uCameraPosition;
uniform vec2 uCameraSize;

attribute vec2 aPosition;
varying vec2 vPosition;

attribute vec2 aCenter;
attribute float aRotation;

void main() {
	vec2 rotated = mat2(
		cos(aRotation), sin(aRotation),
		-sin(aRotation), cos(aRotation)
	) * (aPosition - aCenter) + aCenter;
	// Fix camera size
	vec2 pos = 2. * (rotated - uCameraPosition) / uCameraSize;
	gl_Position = vec4(pos, 0, 1);

	vPosition = rotated;
}