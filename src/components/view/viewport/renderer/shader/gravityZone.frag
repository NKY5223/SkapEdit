precision mediump float;

// time in ms (performance.now())
uniform float uTime;

varying vec4 vFgColor;
varying vec4 vBgColor;
varying vec2 vPosition;
varying float vDirection;
varying float vArrowSpeed;

const float arrowSize = 5.;
// In sizes per second
const float tailWidth = 0.1;
const float tailYStart = 0.2;
const float tailYEnd = 0.75;
const float tailXStart = .5 - tailWidth / 2.;
const float tailXEnd = .5 + tailWidth / 2.;
const float headYCutoff = .5;
const float headYPos = .8;
const float headIn = .1 * sqrt(2.);
const float headOut = 0.;


bool arrow(vec2 pos) {
	vec2 fr = fract(pos);
	vec2 square = mod(pos, 2.);
	// Remove corners
	if (square.x < 1. && square.y > 1.) return false;
	if (square.x > 1. && square.y < 1.) return false;
	// tail
	if (
		fr.x >= tailXStart && fr.x <= tailXEnd &&
		fr.y >= tailYStart && fr.y <= tailYEnd
	) return true;
	// head cutoff
	if (fr.y < headYCutoff) return false;
	float x = abs(fr.x - .5);
	float y = headYPos - fr.y;
	float diff = y - x;
	if (diff <= headIn && diff >= headOut) return true;
	return false;
}

void main() {
	float timeMult = vArrowSpeed / 1000.;

	vec2 scaled = vPosition / arrowSize;
	mat2 rotation = mat2(
		cos(vDirection), -sin(vDirection),
		sin(vDirection), cos(vDirection)
	);
	vec2 rotated = rotation * scaled;
	vec2 translated = rotated - vec2(0, mod(uTime * timeMult, 2.));
	bool fg = arrow(translated);

	gl_FragColor = fg ? vFgColor : vBgColor;
}