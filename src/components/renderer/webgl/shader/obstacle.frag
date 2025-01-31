precision mediump float;

varying vec4 vObstacleColor;
varying vec2 vPosition;

const vec2 patternDirection = vec2(1, 1) / 20.;

void main() {
	float t = fract(dot(vPosition, patternDirection));

	float brightness = (
		t <= 0.21 	? 0.9375 : 
		t <= 0.42 	? 1. : 
		t <= 0.435 	? 0.88671875 : 
					  0.9375
	);

	gl_FragColor = vec4(mix(vec3(brightness), vObstacleColor.rgb, vObstacleColor.a), 1);
}