precision mediump float;

uniform vec2 uCameraPosition;
uniform vec2 uCameraSize;

attribute vec2 aPosition;
varying vec2 vPosition;
attribute vec4 aFgColor;
varying vec4 vFgColor;
attribute vec4 aBgColor;
varying vec4 vBgColor;
attribute float aDirection;
varying float vDirection;
attribute float aArrowSpeed;
varying float vArrowSpeed;

void main() {
	// Fix camera size
	vec2 pos = 2. * (aPosition - uCameraPosition) / uCameraSize;
	gl_Position = vec4(pos, 0, 1);

	vPosition = aPosition;
	vFgColor = aFgColor;
	vBgColor = aBgColor;
	vDirection = aDirection;
	vArrowSpeed = aArrowSpeed;
}