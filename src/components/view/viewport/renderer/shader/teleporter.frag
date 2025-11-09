precision mediump float;

uniform vec4 uObstacleColor;
uniform vec4 uBackgroundColor;

varying vec2 vPosition;
varying float vGrad;

const vec2 patternDirection = vec2(1, 1) / 20.;

float gradient(float x) {
	return smoothstep(0., 1., x);
}

void main() {
	float t = fract(dot(vPosition, patternDirection));

	vec3 other = (
		t <= 0.21 	? vec3(0.9375) : 
		t <= 0.42 	? vec3(1) : 
		t <= 0.435 	? vec3(0.88671875) : 
					  vec3(0.9375)
	);

	vec4 obstacle = vec4(mix(other, uObstacleColor.rgb, uObstacleColor.a), 1);
	gl_FragColor = mix(uBackgroundColor, obstacle, gradient(vGrad));
}