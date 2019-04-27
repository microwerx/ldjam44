uniform mat4 ProjectionMatrix;
uniform mat4 CameraMatrix;
uniform mat4 WorldMatrix;

// Fur uniforms
uniform sampler2D FurTexture;
uniform float FurCurLength;
uniform float FurMaxLength;
uniform vec3 FurDisplacement;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTexcoord;
attribute vec3 aColor;

// These MUST match the fragment shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;
varying vec3 vCamera;

void main() {
    vNormal = (WorldMatrix * vec4(aNormal, 0.0)).xyz;
    vColor = aColor;
    vTexcoord = vec3(aTexcoord.s, 1.0 - aTexcoord.t, aTexcoord.p);
    //vec3 dir = (vec3(2.0, 1.5, 2.0) * normalize(aPosition) + aNormal) / 3.0;
    vec3 dir = normalize(aNormal);
    vec3 fur = aPosition + dir * FurMaxLength * FurCurLength;
    float displacement = pow(FurCurLength, 3.0);
    vec4 p = WorldMatrix * vec4(fur, 1.0);
    p += vec4(displacement * FurDisplacement, 0.0);
    vPosition = p.xyz;
    vCamera = CameraMatrix[3].xyz;
    gl_Position = ProjectionMatrix * CameraMatrix * p;
}
