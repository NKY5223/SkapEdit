precision mediump float;

uniform vec4 uColor;

varying vec2 vPosition;
varying vec2 vUv;

const vec2 patternDirection = vec2(1, 1) / 20.;

void main() {
	
	if (length(vUv - .5) > .5) discard;
	float t = fract(dot(vPosition, patternDirection));

	vec3 other = (
		t <= 0.21 	? vec3(0.9375) : 
		t <= 0.42 	? vec3(1) : 
		t <= 0.435 	? vec3(0.88671875) : 
					  vec3(0.9375)
	);

	gl_FragColor = vec4(mix(other, uColor.rgb, uColor.a), 1);
}