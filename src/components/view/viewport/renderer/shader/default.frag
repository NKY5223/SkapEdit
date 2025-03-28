precision mediump float;

varying vec2 vPosition;

void main() {
	gl_FragColor = vec4(mod(vPosition / 5., 1.), 0, 1);
}