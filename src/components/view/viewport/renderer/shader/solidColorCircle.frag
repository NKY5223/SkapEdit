precision mediump float;

uniform vec4 uColor;
varying vec2 vUv;

void main() {
	if (length(vUv - .5) > .5) discard;
	gl_FragColor = uColor;
}