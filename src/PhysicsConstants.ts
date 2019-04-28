
class PhysicsConstants {
    Mearth = 5.9722e24;
    Rearth = 6.3781e6;
    Rearth2 = 6.3781e6 * 6.3781e6;
    G = 6.674e-11;
    g = -this.Mearth * this.G / this.Rearth2;
    drag = 10.0;
    wind = 0.0;
    constructor() {
    }
}

