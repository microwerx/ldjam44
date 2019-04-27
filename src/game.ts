/// <reference path="../../LibXOR/src/LibXOR.ts" />

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

class PhysicsObject {
    accelerations: Vector3[] = [];
    x = GTE.vec3(0, 0, 0);
    a = GTE.vec3(0, 0, 0);
    v = GTE.vec3(0, 0, 0);
    m = 62.0; // average human mass
    facingDirection = 0;
    bbox = new GTE.BoundingBox();

    constructor() {
        this.bbox.add(GTE.vec3(-0.1, -0.1, 0.0));
        this.bbox.add(GTE.vec3(0.1, 0.1, 0.0));
    }

    /**
     * update(dt)
     * @param {number} dt time in seconds elapsed since the last call
     * @param {PhysicsConstants} constants standard constants for physics calculations
     */
    update(dt: number, constants: PhysicsConstants) {
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
    }

    /**
     *
     * @param {number} minx minimum x world coordinates
     * @param {number} maxx maximum x world coordinates
     * @param {number} miny minimum y world coordinates
     * @param {number} maxy maximum y world coordinates
     */
    bound(minx: number, maxx: number, miny: number, maxy: number) {
        this.x.x = GTE.clamp(this.x.x, minx, maxx);
        this.x.y = GTE.clamp(this.x.y, miny, maxy);
    }
}

class GameApp {
    xor: LibXOR;

    // controls

    leftright = 0.0;
    updown = 0.0;
    anybutton = 0.0;
    b0 = 0.0;
    b1 = 0.0;
    b2 = 0.0;
    b3 = 0.0;

    player: PhysicsObject;
    parrot: PhysicsObject;
    constants: PhysicsConstants;

    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        if (p) p.innerHTML = `LDJAM44.`;

        this.player = new PhysicsObject();
        this.parrot = new PhysicsObject();
        this.constants = new PhysicsConstants();
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        fx.textures.load("godzilla", "models/textures/godzilla.png");
        fx.textures.load("parrot", "models/textures/parrot.png");
        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.addTexture("godzilla", "map_kd");
        rc.useDepthTest = false;

        let pal = this.xor.palette;        
        this.xor.meshes.load('rect', 'models/smallrect.obj', null, null);
        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BROWN));
        bg.rect(-5, -1, 5, -5);
        bg.color3(pal.getColor(pal.YELLOW));
        bg.circle(2, 1.5, 0.25);
    }

    start() {
        this.mainloop();
    }

    updateInput(xor: LibXOR) {
        xor.input.poll();

        this.leftright = 0.0;
        this.updown = 0.0;
        this.anybutton = 0.0;

        // From XBOX ONE / PS4 Controller
        // B0 -> A X        ENTER / JUMP   "SPACE"
        // B1 -> B CIRCLE   CANCEL/ BACK   "ESCAPE"
        // B2 -> X SQUARE   SHIFT / RUN    "CONTROL"
        // B3 -> Y TRIANGLE MENU  / ACTION "ENTER"
        let b0Keys = ["Space"];
        let b1Keys = ["Escape", "Esc"];
        let b2Keys = ["Control", "ControlLeft", "ControlRight"];
        let b3Keys = ["Enter"];
        let dirLKeys = ["ArrowLeft", "Left", "A", "a"];
        let dirRKeys = ["ArrowRight", "Right", "D", "d"];
        let dirUKeys = ["ArrowUp", "Up", "W", "w"];
        let dirDKeys = ["ArrowDown", "Down", "S", "s"];
        this.b0 = xor.input.checkKeys(b0Keys) ? 1.0 : 0.0;
        this.b1 = xor.input.checkKeys(b1Keys) ? 1.0 : 0.0;
        this.b2 = xor.input.checkKeys(b2Keys) ? 1.0 : 0.0;
        this.b3 = xor.input.checkKeys(b3Keys) ? 1.0 : 0.0;
        if (xor.input.checkKeys(dirLKeys)) {
            this.leftright -= 1.0;
        }
        if (xor.input.checkKeys(dirRKeys)) {
            this.leftright += 1.0;
        }
        if (xor.input.checkKeys(dirUKeys)) {
            this.updown += 1.0;
        }
        if (xor.input.checkKeys(dirDKeys)) {
            this.updown -= 1.0;
        }
        this.anybutton = (this.b0 + this.b1 + this.b2 + this.b3) > 0.0 ? 1.0 : 0.0;

        for (let i = 0; i < 4; i++) {
            let gp = xor.input.gamepads.get(i);
            if (!gp || !gp.enabled) {
                continue;
            }
            this.updown = gp.updown;
            this.leftright = gp.leftright;
            this.anybutton = (this.anybutton > 0.0 || gp.b0 || gp.b1 || gp.b2 || gp.b3) ? 1.0 : 0.0;
        }
    }

    update(dt: number) {
        let xor = this.xor;
        this.updateInput(xor);
        this.updateGame(xor.dt);
    }

    resetGame() {
        this.parrot.x.reset(2, 0, 0);
        this.player.x.reset(-2, 0, 0);
    }

    updateGame(dt: number) {
        this.player.accelerations = [
            GTE.vec3(0.0, -this.updown * this.constants.g * 2, 0.0),
            GTE.vec3(this.leftright * 10.0, 0.0, 0.0),
        ];
        this.player.update(dt, this.constants);
        this.player.bound(-2.0, 2.0, 0.0, 2.0);
        this.parrot.update(dt, this.constants);
        this.parrot.bound(-2.0, 2.0, 0.0, 1.0);


    }

    render() {
        let xor = this.xor;
        let fx = xor.fx;
        xor.graphics.clear(xor.palette.AZURE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 2.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniform1f("map_kd_mix", 0.0);
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('bg', rc);

            rc.uniform1f("map_kd_mix", 1.0);

            // render player
            let tex = fx.textures.get("godzilla");
            if (tex) tex.bind();
            let m = Matrix4.makeTranslation3(this.player.x);
            m.scale(this.player.facingDirection > 0 ? -1 : 1, 1, 1);
            rc.uniformMatrix4f('WorldMatrix', m);
            xor.meshes.render('rect', rc);

            tex = fx.textures.get("parrot");
            if (tex) tex.bind();
            m = Matrix4.makeTranslation3(this.parrot.x);
            m.scale(this.parrot.facingDirection > 0 ? -1 : 1, 1, 1);
            rc.uniformMatrix4f('WorldMatrix', m);
            xor.meshes.render('rect', rc);
        }
        xor.renderconfigs.use(null);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.update(self.xor.dt);
            self.render();
            self.mainloop();
        });
    }
}

function start() {
    let game = new GameApp();
    game.init();
    game.start();
}