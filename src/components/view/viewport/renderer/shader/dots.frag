precision mediump float;

uniform vec4 uColor;
uniform vec4 uDotsColor;

varying vec2 vPosition;

const vec2 patternSize = vec2(20);
const float circleSize = .05;

void main() {
	vec2 p = fract(vPosition / patternSize);

	float t = min(min(min(min(
		length(vec2(0, 0) - p),
		length(vec2(0, 1) - p)),
		length(vec2(1, 0) - p)),
		length(vec2(1, 1) - p)),
		length(vec2(.5, .5) - p));

	float strength = t <= circleSize ? 1. : 0.;

	gl_FragColor = vec4(mix(uColor.rgb, uDotsColor.rgb, strength), 1);
}