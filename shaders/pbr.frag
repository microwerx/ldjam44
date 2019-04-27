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

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    // set to white
    vec3 color = vec3(0.0);
    if (map_kd_mix > 0.0) {
        vec3 map = texture2D(map_kd, vTexcoord.st).rgb;
        color += map * map_kd_mix + (1.0 - map_kd_mix) * kd;
    } else {
        color += kd;
    }
    vec3 L = normalize(sunDirTo);
    vec3 N = normalize(vNormal);
    float NdotL = max(0.0, 0.5+0.5*dot(N, L));
    gl_FragColor = vec4(NdotL * color, 1.0);
}
