/// <reference path="../../LibXOR/src/LibXOR.ts" />
/// <reference path="htmlutils.ts" />

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

function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

function smootherstep(x: number) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
}

class GameData
{
    hungry = 0.5;
    food = 10.0;

    thirsty = 0.5;
    water = 1;

    fur = 0.0;
    curFur = 0;
    maxFur = 5;
    furCollected = 0;

    poop = 1.0;
    papayaChews = 10;

    health = 1.0;
    vegetables = 10;

    money = 10.0;

    days = 0;
    t1 = 0;
    gameSpeed = 5;

    constructor(public t0: number) {
        this.t1 = t0;
    }

    update(t1: number, dt: number) {
        if (t1 < this.t0) return;
        this.t1 += dt;
        this.days = this.t1 - this.t0;
        let amount = 1 - smootherstep(this.curFur);
        this.curFur += dt * amount / 90.0 * this.gameSpeed;
        this.fur = this.curFur * this.maxFur;
    }  
    
    feedHay() {
        let foodAmount = 1;
        this.hungry = sigmoid(this.hungry + foodAmount);
        this.food -= foodAmount;
    }

    groom() {
        let groomAmount = 0.1;
        let before = this.curFur;
        this.curFur = GTE.clamp(this.curFur - groomAmount, 0, 1);
        this.furCollected += before - this.curFur;
    }

    sell() {
        let quality = 1;
        let sellingRate = 13 + Math.sin(this.t1);
        this.money += quality * this.furCollected * sellingRate;
        this.furCollected = 0;
    }

    giveWater() {
        throw new Error("Method not implemented.");
    }
    giveVeggies() {
        throw new Error("Method not implemented.");
    }
    giveTreats() {
        let quality = 1;
        let amount = Math.min(0.1 * this.vegetables);
        this.vegetables -= amount;
        this.health = GTE.clamp(this.health + amount * quality, 0, 1);
    }
    brushBunny() {
        throw new Error("Method not implemented.");
    }
    cleanArea() {
        throw new Error("Method not implemented.");
    }
}

class GameApp {
    xor: LibXOR;

    // controls

    zqsd = false;
    joyMoveX = 0.0;
    joyMoveY = 0.0;
    joyMoveZ = 0.0;
    joyTurnZ = 0.0;
    joyTurnY = 0.0;
    joyTurnX = 0.0;
    joyMove = new Vector3();
    joyTurn = new Vector3();
    anybutton = 0.0;
    b0 = 0.0;
    b1 = 0.0;
    b2 = 0.0;
    b3 = 0.0;
    game: GameData;

    get loaded(): boolean {
        if (!this.xor.textfiles.loaded) return false;
        else if (!this.xor.fx.textures.loaded) return false;
        return true;
    }

    // camera view
    cameraCenter = new Vector3(0, 0, 0);
    cameraZoom = 1.0;
    cameraAzimuth = 0.0;
    sunAz = 45.0;
    sunPitch = 45.0;

    // fur controls
    iFurNumLayers = 1;
    fFurMaxLength = 1;
    fKdMix = 0.5;
    fFurGravity = 0.0;

    player: PhysicsObject;
    parrot: PhysicsObject;
    constants: PhysicsConstants;

    constructor() {
        this.xor = new LibXOR("project");

        this.player = new PhysicsObject();
        this.parrot = new PhysicsObject();
        this.constants = new PhysicsConstants();
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        fx.textures.load("test", "models/textures/test_texture.png");
        fx.textures.load("test_normal", "models/textures/test_normal_map_dunes.png");
        fx.textures.load("fur1", "images/fur1.png");
        fx.textures.load("furThickness", "models/textures/noise15.png");
        fx.textures.load("grass", "images/grass.png");
        fx.textures.load("godzilla", "models/textures/godzilla.png");
        fx.textures.load("parrot", "models/textures/parrot.png");
        let gui = this.xor.renderconfigs.load('gui', 'shaders/basic.vert', 'shaders/basic.frag');
        gui.useDepthTest = false;
        let pbr = this.xor.renderconfigs.load('pbr', 'shaders/pbr.vert', 'shaders/pbr.frag');
        pbr.addTexture("test", "map_kd");
        pbr.addTexture("test", "map_ks");
        pbr.addTexture("test", "map_normal");
        let fur = this.xor.renderconfigs.load('fur', 'shaders/fur.vert', 'shaders/fur.frag');
        fur.addTexture("test", "map_kd");
        fur.addTexture("fur1", "FurTexture");
        fur.addTexture("furThickness", "FurThickness");

        this.xor.meshes.load('bunny', 'models/bunny_lores.obj', null, null);
        this.xor.meshes.load('bunnyshell', 'models/bunny_lores_shell.obj', null, null);
        this.xor.meshes.load('bunnypen', 'models/bunnypen.obj', null, null);

        this.initControls();
    }

    initControls() {
        let c = <HTMLDivElement>document.getElementById('controls');
        if (!c) return;
        createRangeRow(c, "fFurMaxLength", 0.1, 0.01, 0.25, 0.001);
        createRangeRow(c, "fKdMix", 0.25, 0.0, 1.0, 0.1);
        createRangeRow(c, "iFurNumLayers", 50, 1, 50, 1);
        createRangeRow(c, "fFurGravity", 0.0, 0.0, 0.1, 0.005);
    }

    syncControls() {
        this.iFurNumLayers = getRangeValue("iFurNumLayers");
        this.fKdMix = getRangeValue("fKdMix");
        this.fFurMaxLength = getRangeValue("fFurMaxLength");
        this.fFurGravity = getRangeValue("fFurGravity");
    }

    start() {
        this.reset();
        this.mainloop();
    }

    updateInput(xor: LibXOR) {
        this.syncControls();
        xor.input.poll();

        this.joyMoveX = 0.0;
        this.joyMoveY = 0.0;
        this.joyMoveZ = 0.0;
        this.joyTurnX = 0.0;
        this.joyTurnY = 0.0;
        this.joyTurnZ = 0.0;
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

        // s1 as in stick 1 and s2 as in stick 2

        let posMoveZKeys = this.zqsd ? ["Z", "z"] : ["W", "w"];
        let negMoveXKeys = this.zqsd ? ["Q", "q"] : ["A", "a"];
        let negMoveZKeys = this.zqsd ? ["S", "s"] : ["S", "s"];
        let posMoveXKeys = this.zqsd ? ["D", "d"] : ["D", "d"];
        let negTurnZKeys = this.zqsd ? ["A", "a"] : ["Q", "q"];
        let posTurnZKeys = this.zqsd ? ["E", "e"] : ["E", "e"];
        let posMoveYKeys = this.zqsd ? ["W", "w"] : ["Z", "z"];
        let negMoveYKeys = this.zqsd ? ["C", "c"] : ["C", "c"];
        let negTurnYKeys = ["ArrowLeft", "Left"];
        let posTurnYKeys = ["ArrowRight", "Right"];
        let posTurnXKeys = ["ArrowUp", "Up"];
        let negTurnXKeys = ["ArrowDown", "Down"];

        this.b0 = xor.input.checkKeys(b0Keys) ? 1.0 : 0.0;
        this.b1 = xor.input.checkKeys(b1Keys) ? 1.0 : 0.0;
        this.b2 = xor.input.checkKeys(b2Keys) ? 1.0 : 0.0;
        this.b3 = xor.input.checkKeys(b3Keys) ? 1.0 : 0.0;

        if (xor.input.checkKeys(negMoveXKeys)) this.joyMoveX -= 1.0;
        if (xor.input.checkKeys(posMoveXKeys)) this.joyMoveX += 1.0;
        if (xor.input.checkKeys(negMoveZKeys)) this.joyMoveZ -= 1.0;
        if (xor.input.checkKeys(posMoveZKeys)) this.joyMoveZ += 1.0;
        if (xor.input.checkKeys(negMoveYKeys)) this.joyMoveY -= 1.0;
        if (xor.input.checkKeys(posMoveYKeys)) this.joyMoveY += 1.0;

        if (xor.input.checkKeys(negTurnXKeys)) this.joyTurnX -= 1.0;
        if (xor.input.checkKeys(posTurnXKeys)) this.joyTurnX += 1.0;
        if (xor.input.checkKeys(negTurnYKeys)) this.joyTurnY -= 1.0;
        if (xor.input.checkKeys(posTurnYKeys)) this.joyTurnY += 1.0;
        if (xor.input.checkKeys(negTurnZKeys)) this.joyTurnZ -= 1.0;
        if (xor.input.checkKeys(posTurnZKeys)) this.joyTurnZ += 1.0;

        this.anybutton = (this.b0 + this.b1 + this.b2 + this.b3) > 0.0 ? 1.0 : 0.0;

        for (let i = 0; i < 4; i++) {
            let gp = xor.input.gamepads.get(i);
            if (!gp || !gp.enabled) {
                continue;
            }
            this.joyMoveZ = gp.updown;
            this.joyMoveX = gp.leftright;
            this.anybutton = (this.anybutton > 0.0 || gp.b0 || gp.b1 || gp.b2 || gp.b3) ? 1.0 : 0.0;
        }

        this.joyMove.reset(this.joyMoveX, this.joyMoveY, this.joyMoveZ);
        this.joyTurn.reset(this.joyTurnX, this.joyTurnY, this.joyTurnZ);
    }

    update(dt: number) {
        let xor = this.xor;
        this.updateInput(xor);
        this.updatePlayer(dt);
        this.updateGame();

        //this.cameraAzimuth += this.joyTurnY * dt * 25;
    }

    reset() {
        this.xor.t0 = this.xor.t1;
        this.game = new GameData(this.xor.t1 + 5);
        this.player.reset(0, 3, 0);
        this.cameraCenter = new Vector3(0, 0, 0);
        this.cameraZoom = 1.0;
        this.cameraAzimuth = 0.0;
        this.sunAz = 45.0;
        this.sunPitch = 45.0;
    }

    updateGame() {
        this.game.update(this.xor.t1, this.xor.dt);
    }

    updatePlayer(dt: number) {
        const turnSpeed = 50;

        this.player.accelerations = [
            GTE.vec3(0.0, -this.joyMoveZ * this.constants.g * 2, 0.0),
            GTE.vec3(0.0 * this.joyMoveX * 10.0, 0.0, 0.0),
        ];
        this.player.update(dt, this.constants);
        this.player.bound(-4.5, 4.5, 0.0, 2.0);

        // this.player.worldMatrix.rotate(turnSpeed * this.joyTurnX * dt, 1, 0, 0);
        this.player.worldMatrix.rotate(turnSpeed * this.joyTurnY * dt, 0, 1, 0);
        // this.player.worldMatrix.rotate(turnSpeed * this.joyTurnZ * dt, 0, 0, 1);
        this.player.worldMatrix.translate3(this.joyMove.scale(dt));

        let t = this.xor.input.touches[0];
        if (t.pressed) {
            this.player.worldMatrix.rotate(turnSpeed * t.dx * dt, 0, 1, 0);
            this.player.worldMatrix.translate(0, 0, -t.dy * dt);
            t.dx = 0;
            t.dy = 0;
        }

        this.player.x.reset();
    }

    setMaterial(rc: Fluxions.FxRenderConfig, texture: string, uniform: string, unit: number) {
        rc.bindTextureUniform(uniform, texture, unit);
    }

    renderBar(mesh: Fluxions.FxIndexedGeometryMesh, value: number, color: number, x: number, w: number) {
        mesh.color3(this.xor.palette.calcColor(color, 0, 4, 0, 0, 0));
        // mesh.rect(x, 0, x + 10, 100);
        mesh.color3(this.xor.palette.calcColor(color, 0, 0, 0, 0, 0));
        mesh.rect(x, 0, x + 10, value * 100);
    }

    rendergui() {
        let xor = this.xor;
        let mesh = new Fluxions.FxIndexedGeometryMesh(this.xor.fx);        

        let w = 10;
        this.renderBar(mesh, this.game.hungry, 15, w*0, w);
        this.renderBar(mesh, this.game.thirsty, 8, w*1, w);
        this.renderBar(mesh, this.game.curFur, 12, w*2, w);
        this.renderBar(mesh, this.game.money / 100, 13, xor.graphics.width - w*1, w);
        this.renderBar(mesh, this.game.food / 100, 13, xor.graphics.width - w*2, w);

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();
        let rc = xor.renderconfigs.use('gui');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
            mesh.render(rc, xor.fx.scenegraph);
            rc.restore();
        }
    }

    render() {
        let xor = this.xor;
        let fx = xor.fx;
        xor.graphics.clear(xor.palette.AZURE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90 + this.cameraAzimuth, 30, 3.0);
        cmatrix.translate(0.0, -0.5, 0.0);
        cmatrix = Matrix4.makeLookAt(GTE.vec3(0, 2, 6), this.player.position, GTE.vec3(0, 1, 0));
        let lmatrix = Matrix4.makeOrbit(this.sunAz, this.sunPitch, 1);

        let rc = xor.renderconfigs.use('pbr');
        if (rc) {
            rc.uniform3f("sunDirTo", lmatrix.diag3());
            this.setMaterial(rc, "grass", "map_kd", -1);
            rc.uniform1f("map_kd_mix", 0.5);
            rc.uniform3f("kd", xor.palette.getColor(15));
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
            xor.meshes.render('bunnypen', rc);

            rc.uniform1f("map_kd_mix", 0.0);
            rc.uniform3f("kd", xor.palette.getColor(3));

            // render player
            this.setMaterial(rc, "fur1", "FurTexture", -1);
            rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
            xor.meshes.render('bunny', rc);
        }

        rc = xor.renderconfigs.use('fur');
        if (rc) {
            rc.uniform3f("sunDirTo", lmatrix.diag3());
            this.setMaterial(rc, "test", "map_kd", -1);
            rc.uniform3f("kd", xor.palette.getColor(15));
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform1f("map_kd_mix", this.fKdMix);
            rc.uniform3f("kd", xor.palette.getColor(3));

            let m = Matrix4.makeTranslation3(this.player.x);
            rc.uniformMatrix4f('WorldMatrix', m);

            for (let i = 0; i < this.iFurNumLayers; i++) {
                let curLength = (i + 1) / (this.iFurNumLayers - 1);
                let gravity = 0.05 * this.game.curFur;//-this.fFurGravity;
                let displacement = GTE.vec3(0.0, gravity, 0.0).add(GTE.vec3(0.01 * Math.sin(xor.t1 * 0.5), 0.0, 0.0));
                rc.uniform1f("FurMaxLength", this.fFurMaxLength * this.game.fur);
                rc.uniform1f("FurCurLength", curLength);
                rc.uniform3f("FurDisplacement", displacement);
                rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
                xor.meshes.render('bunnyshell', rc);
            }
        }
        xor.renderconfigs.use(null);

        this.rendergui();
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

    /* Buttons from main page */

    feed() {
        this.game.feedHay();
        hflog.info("food/hungry: " + this.game.food + ", " + this.game.hungry);
    }

    water() {
        this.game.giveWater();
    }

    groom() {
        this.game.groom();
        hflog.info("fur: " + this.game.curFur);
    }

    giveVeggies() {
        this.game.giveVeggies();
    }

    giveTreats() {
        this.game.giveTreats();
    }

    brushBunny() {
        this.game.brushBunny();
    }

    cleanArea() {
        this.game.cleanArea();
    }

    sell() {
        this.game.sell();
    }
}

var game: GameApp;
var trystartfn: any;

function start() {
    game = new GameApp();
    game.init();
    toggle('gamecontrols');
    trystartfn = setInterval(() => {
        trystart();
    }, 250);
}

function trystart() {
    if (!game.loaded) {
        hflog.info("loading!");
        return;
    }
    hflog.info("starting!");
    clearInterval(trystartfn);
    game.start();
}

toggle('gamecontrols');