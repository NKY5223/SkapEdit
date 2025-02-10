precision mediump float;

uniform vec2 uCameraPosition;
uniform vec2 uCameraSize;
uniform vec4 uObstacleColor;

attribute vec2 aPosition;
varying vec2 vPosition;
varying vec4 vObstacleColor;

void main() {
	gl_Position = vec4((aPosition - uCameraPosition) / uCameraSize, 0, 1);

	vPosition = aPosition;
	vObstacleColor = uObstacleColor;
}