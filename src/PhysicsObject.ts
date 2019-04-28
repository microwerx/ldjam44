class PhysicsObject {
    accelerations: Vector3[] = [];
    x = GTE.vec3(0, 0, 0);
    a = GTE.vec3(0, 0, 0);
    v = GTE.vec3(0, 0, 0);
    m = 62.0; // average human mass
    facingDirection = 0;
    bbox = new GTE.BoundingBox();
    worldMatrix = Matrix4.makeIdentity();

    constructor() {
        this.bbox.add(GTE.vec3(-4.5, -4.5, 0.0));
        this.bbox.add(GTE.vec3(4.5, 4.5, 2.0));
    }

    reset(x: number, y: number, z: number) {
        this.worldMatrix.m14 = x;
        this.worldMatrix.m24 = y;
        this.worldMatrix.m34 = z;
    }

    /**
     * update(dt)
     * @param {number} dt time in seconds elapsed since the last call
     * @param {PhysicsConstants} constants standard constants for physics calculations
     */
    update(dt: number, constants: PhysicsConstants) {
        this.x = this.worldMatrix.col3(3);

        this.a = GTE.vec3(0.0, 0.0, 0.0);
        for (let i = 0; i < this.accelerations.length; i++) {
            this.a.accum(this.accelerations[i], 1.0);
        }

        let accelerations = [
            GTE.vec3(0.0, constants.g, 0.0),
            this.v.scale(-constants.drag)
        ];
        for (let i = 0; i < accelerations.length; i++) {
            this.a.accum(accelerations[i], 1.0);
        }

        this.v = GTE.vec3(
            0.5 * (this.v.x + this.a.x * dt + this.v.x),
            0.5 * (this.v.y + this.a.y * dt + this.v.y),
            0.5 * (this.v.z + this.a.z * dt + this.v.z)
        );

        if (this.v.x < 0) {
            this.facingDirection = -1;
        } else if (this.v.x > 0) {
            this.facingDirection = 1;
        }

        this.x.accum(this.v, dt);
        this.worldMatrix.m14 = this.x.x;
        this.worldMatrix.m24 = this.x.y;
        this.worldMatrix.m34 = this.x.z;
    }

    /**
     *
     * @param {number} minx minimum x world coordinates
     * @param {number} maxx maximum x world coordinates
     * @param {number} miny minimum y world coordinates
     * @param {number} maxy maximum y world coordinates
     */
    bound(minx: number, maxx: number, miny: number, maxy: number) {
        this.x = this.worldMatrix.transform3(GTE.vec3());
        this.worldMatrix.translate(-this.x.x, -this.x.y, -this.x.z);
        this.x.x = GTE.clamp(this.x.x, minx, maxx);
        this.x.y = GTE.clamp(this.x.y, miny, maxy);
        this.x.z = GTE.clamp(this.x.z, minx, maxx);
        this.worldMatrix.m14 = this.x.x;
        this.worldMatrix.m24 = this.x.y;
        this.worldMatrix.m34 = this.x.z;
    }

    get position(): Vector3 {
        return this.worldMatrix.col3(3);
    }
}
