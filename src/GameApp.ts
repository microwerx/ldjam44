/// <reference path="../../LibXOR/LibXOR.d.ts" />
/// <reference path="htmlutils.ts" />
/// <reference path="math.ts" />
/// <reference path="PhysicsObject.ts" />
/// <reference path="PhysicsConstants.ts" />
/// <reference path="GameLogic.ts" />


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
    game!: GameLogic;
    grave = false;

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
        fx.textures.load("grass1", "images/grass1.jpg");
        fx.textures.load("grass2", "images/grass2.jpg");
        fx.textures.load("grass3", "images/grass3.jpg");
        fx.textures.load("grass4", "images/grass4.jpg");
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
        this.xor.meshes.load('teapot', 'models/teapot.obj', null, null);

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

    syncLabels() {
        setSpan("totalMoney", this.game.money.toFixed(2));
        setSpan("totalDays", this.game.days.toFixed(2) + "/" + this.game.totalWool.toFixed(2) + " ounces");
        setSpan("totalWool", this.game.wool.toFixed(2));
        setSpan("woolMarket", this.game.woolMarketValue.toFixed(2));
        setSpan("hayUnits", this.game.hayUnits.toFixed(2));
        setSpan("pelletUnits", this.game.pelletUnits.toFixed(2));
        setSpan("veggieUnits", this.game.veggieUnits.toFixed(2));
        setSpan("treatUnits", this.game.treatUnits.toFixed(2));
        setSpan("hayCost", this.game.hayCost.toFixed(2));
        setSpan("pelletCost", this.game.pelletCost.toFixed(2));
        setSpan("veggieCost", this.game.veggieCost.toFixed(2));
        setSpan("treatCost", this.game.treatCost.toFixed(2));
    }

    start() {
        this.reset();
        this.mainloop();
    }

    updateInput(xor: LibXOR) {
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
        this.syncControls();
        this.updateInput(xor);
        this.updatePlayer(dt);
        this.updateGame();
        this.syncLabels();
        //this.cameraAzimuth += this.joyTurnY * dt * 25;
    }

    reset() {
        this.xor.t0 = this.xor.t1;
        this.game = new GameLogic(this.xor.t1 + 5);
        this.player.reset(0, 3, 0);
        this.cameraCenter = new Vector3(0, 0, 0);
        this.cameraZoom = 1.0;
        this.cameraAzimuth = 0.0;
        this.sunAz = 45.0;
        this.sunPitch = 45.0;
        this.grave = false;
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

        if (this.game.life < 0) {
            let amount = GTE.clamp(this.game.life * 0.3, -6, 0);
            if (amount <= -3) {
                this.grave = true;
                amount = GTE.clamp(-6 + Math.abs(amount), -3, 0);
            }
            this.player.worldMatrix.translate(0, amount, 0);
        }

        let X0 = this.player.position;

        let turnY = -this.joyTurnY;
        let moveZ = this.joyTurnX;

        if (this.xor.input.mouse.buttons) {
            turnY -= GTE.clamp(this.xor.input.mouse.delta.x, -1, 1);
            moveZ -= GTE.clamp(this.xor.input.mouse.delta.y, -1, 1);
            this.xor.input.mouse.delta.reset(0, 0);
        }

        let t = this.xor.input.touches[0];
        if (t.pressed) {
            turnY += GTE.clamp(t.dx, -1, 1);
            moveZ -= GTE.clamp(t.dy, -1, 1);
            t.dx = 0;
            t.dy = 0;
        }

        moveZ = GTE.clamp(moveZ, -1, 1) * (0.5 + this.game.hayNutrition * this.game.watered + this.game.treatNutrition * this.game.watered);

        this.player.worldMatrix.rotate(turnSpeed * turnY * dt, 0, 1, 0);
        this.player.worldMatrix.translate(0, 0, moveZ * dt);
        this.player.x.reset();
        let X1 = this.player.position;
        this.game.exercise(X0.distance(X1));
    }

    setMaterial(rc: Fluxions.FxRenderConfig, texture: string, uniform: string, unit: number) {
        rc.bindTextureUniform(uniform, texture, unit);
    }

    renderBar(mesh: Fluxions.FxIndexedGeometryMesh, value: number, color: number, x: number, w: number) {
        mesh.color3(this.xor.palette.calcColor(color, 0, 0, 0, 0, 0));
        mesh.rect(x, 0, x + 10, value * 100);
        mesh.color3(this.xor.palette.calcColor(color, 0, 4, 0, 0, 0));
        mesh.rect(x, 0, x + 10, 100);
    }

    rendergui() {
        let xor = this.xor;
        let mesh = new Fluxions.FxIndexedGeometryMesh(this.xor.fx);

        let w = 10;
        this.renderBar(mesh, this.game.hayNutrition, 14, w * 1, w);
        this.renderBar(mesh, this.game.pelletNutrition, 8, w * 2, w);
        this.renderBar(mesh, this.game.veggieNutrition, 5, w * 3, w);
        this.renderBar(mesh, this.game.treatNutrition, 7, w * 4, w);
        this.renderBar(mesh, this.game.watered, 9, w * 5, w);
        this.renderBar(mesh, this.game.curFur, 12, w * 6, w);
        this.renderBar(mesh, this.game.woolQuality, 3, w * 7, w);
        this.renderBar(mesh, this.game.health, 11, w * 8, w);
        this.renderBar(mesh, this.game.exercised, 13, w * 9, w);
        // this.renderBar(mesh, this.game.money / 100, 13, xor.graphics.width - w * 2, w);
        // this.renderBar(mesh, this.game.hayUnits / 100, 13, xor.graphics.width - w * 3, w);
        this.renderBar(mesh, this.game.life / (5 * 365), 4, xor.graphics.width - w * 2, w * 2);

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
            this.setMaterial(rc, "grass1", "map_kd", -1);
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
            if (this.grave) {
                xor.meshes.render('teapot', rc);
            } else {
                xor.meshes.render('bunny', rc);
            }
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
                let gravity = 0.5 * this.game.curFur;//-this.fFurGravity;
                let displacement = GTE.vec3(0.0, gravity, 0.0).add(GTE.vec3(0.01 * Math.sin(xor.t1 * 0.5), 0.0, 0.0));
                rc.uniform1f("FurMaxLength", this.fFurMaxLength * this.game.fur);
                rc.uniform1f("FurCurLength", curLength);
                rc.uniform3f("FurDisplacement", displacement);
                rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
                if (this.grave) {
                    xor.meshes.render('teapot', rc);
                } else {
                    xor.meshes.render('bunnyshell', rc);
                }
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

    feedHay() {
        this.game.feedHay();
    }

    feedPellets() {
        this.game.feedPellets();
    }

    feedVeggies() {
        this.game.feedVeggies();
    }

    feedTreats() {
        this.game.feedTreats();
    }

    water() {
        this.game.giveWater();
    }

    groom() {
        this.game.groom();
        hflog.info("fur: " + this.game.curFur);
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

    buyHay(x: number) {
        this.game.buyHay(x);
    }

    buyPellets(x: number) {
        this.game.buyPellets(x);
    }

    buyVeggies(x: number) {
        this.game.buyVeggies(x);
    }

    buyTreats(x: number) {
        this.game.buyTreats(x);
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