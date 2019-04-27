precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// Fur uniforms
uniform sampler2D FurTexture;
uniform sampler2D FurThickness;
uniform float FurCurLength;
uniform float FurMaxLength;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

float lerp(float x, float y, float s)
{
    return x * (1.0 - s) + y * s;
}

void main() {
    // set to white
    vec3 color = vec3(0.0);
    if (map_kd_mix > 0.0) {
        vec3 map = texture2D(map_kd, vTexcoord.st).rgb;
        color += map * map_kd_mix + (1.0 - map_kd_mix) * kd;
    } else {
        color += kd;
    }

    // get fur
    vec4 furThick = texture2D(FurThickness, vTexcoord.st);
    vec4 furTexel = texture2D(FurTexture, vTexcoord.st);
    furTexel = (1.0 - map_kd_mix) * furTexel + map_kd_mix * vec4(1.0);
    float furVisibility = (FurCurLength > furThick.a) ? 0.0 : furTexel.a;
    furTexel.a = (FurCurLength == 0.0) ? 1.0 : furVisibility;
    if (furTexel.a < 0.5) discard;
    float furShadow = lerp(0.4, 1.0, FurCurLength);

    vec3 L = normalize(sunDirTo);
    vec3 N = normalize(vNormal);
    float NdotL = max(0.0, 0.75 + 0.25 * dot(N, L));
    gl_FragColor = vec4(NdotL * color * furShadow, 1.0);
}
