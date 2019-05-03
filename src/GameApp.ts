/// <reference path="../LibXOR.d.ts" />
/// <reference path="htmlutils.ts" />
/// <reference path="math.ts" />
/// <reference path="PhysicsObject.ts" />
/// <reference path="PhysicsConstants.ts" />
/// <reference path="GameLogic.ts" />


class GameApp {
    xor!: LibXOR;

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
    gameStarted = false;
    gameInitialized = false;
    initialSpeed = 1;

    lbsent = false;
    lbcount = 0;

    get loaded(): boolean {
        if (!this.xor.textfiles.loaded) return false;
        else if (!this.xor.fx.textures.loaded) return false;
        else if (!this.xor.sound.sampler.loaded) return false;
        return true;
    }

    // camera view
    cameraCenter = new Vector3(0, 0, 0);
    cameraZoom = 1.0;
    cameraAzimuth = 0.0;
    sunAz = 45.0;
    sunPitch = 45.0;

    // fur controls
    iFurNumLayers = 50;
    fFurMaxLength = 0.1;
    fKdMix = 0.5;
    fFurGravity = 0.0;

    // sound
    musicStarted = false;
    endMusicStarted = false;

    player!: PhysicsObject;
    parrot!: PhysicsObject;
    constants!: PhysicsConstants;

    constructor() {
    }

    init() {
        this.xor = new LibXOR("project");

        this.player = new PhysicsObject();
        this.parrot = new PhysicsObject();
        this.constants = new PhysicsConstants();

        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(512, 384);
        this.xor.input.init();
        this.xor.sound.init();

        let fx = this.xor.fluxions;
        fx.textures.load("test", "models/textures/test_texture.png");
        fx.textures.load("test_normal", "models/textures/test_normal_map_dunes.png");
        fx.textures.load("fur1", "images/fur1.png");
        fx.textures.load("furThickness", "models/textures/noise15.png");
        fx.textures.load("fur", "images/furtexture.jpg");
        fx.textures.load("kamen", "models/textures/sponza_kamen.png");
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
        fur.addTexture("fur", "map_kd");
        fur.addTexture("fur1", "FurTexture");
        fur.addTexture("furThickness", "FurThickness");

        this.xor.meshes.load('bunny', 'models/bunny_lores.obj', null, null);
        this.xor.meshes.load('bunnyshell', 'models/bunny_lores_shell.obj', null, null);
        this.xor.meshes.load('bunnypen', 'models/bunnypen.obj', null, null);
        this.xor.meshes.load('tombstone', 'models/tombstone.obj', null, null);

        let s = this.xor.sound.sampler;
        s.loadSample(0, "sounds/furtual_rabbit_start.mp3");
        s.loadSample(1, "sounds/furtual_rabbit_end.mp3");
        s.loadSample(2, "sounds/furtual_rabbit_main.mp3");
        s.loadSample(3, "sounds/Snare1.wav");

        this.initControls();

        this.gameInitialized = true;
    }

    initControls() {
        let c = <HTMLDivElement>document.getElementById('controls');
        if (!c) return;
        // createRangeRow(c, "fFurMaxLength", 0.1, 0.01, 0.25, 0.001);
        // createRangeRow(c, "fKdMix", 0.25, 0.0, 1.0, 0.1);
        // createRangeRow(c, "iFurNumLayers", 50, 1, 50, 1);
        // createRangeRow(c, "fFurGravity", 0.0, 0.0, 0.1, 0.005);
    }

    syncControls() {
        // this.iFurNumLayers = getRangeValue("iFurNumLayers");
        // this.fKdMix = getRangeValue("fKdMix");
        // this.fFurMaxLength = getRangeValue("fFurMaxLength");
        // this.fFurGravity = getRangeValue("fFurGravity");
    }

    syncLabels() {
        let wool = this.game.woolInOunces.toFixed(2) + "/" + this.game.groomedWoolInOunces.toFixed(2);
        let market = this.game.woolAverageValue.toFixed(2);// + "/" + this.game.groomedAverageValue.toFixed(2);
        setSpan("totalDays", this.game.days.toFixed(1) + " / " + this.game.totalWool.toFixed(1) + " oz / $" + this.game.totalMoney.toFixed(2));
        setSpan("totalMoney", this.game.money.toFixed(2));
        setSpan("groomMoney", this.game.woolValueAtMarket.toFixed(2));
        setSpan("totalWool", wool);
        setSpan("woolMarket", market);
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
        if (!this.loaded) return;
        let xor = this.xor;
        this.syncControls();
        this.updateInput(xor);
        this.updatePlayer(dt);
        this.updateGame(dt);
        this.syncLabels();
        //this.cameraAzimuth += this.joyTurnY * dt * 25;
    }

    reset() {
        if (!this.gameInitialized) return;
        this.xor.t0 = this.xor.t1;
        this.game = new GameLogic(this.xor.t1 + 10, this.initialSpeed);
        this.player.reset(0, 3, 0);
        this.cameraCenter = new Vector3(0, 0, 0);
        this.cameraZoom = 1.0;
        this.cameraAzimuth = 0.0;
        this.sunAz = 45.0;
        this.sunPitch = 45.0;
        this.grave = false;
        this.gameStarted = false;

        this.musicStarted = false;
        this.endMusicStarted = false;

        this.lbcount++;
        this.lbsent = false;

        // reset audio
        this.xor.sound.sampler.stopSample(0);
        this.xor.sound.sampler.stopSample(1);
        this.xor.sound.sampler.stopSample(2);
        this.xor.sound.sampler.playSample(0);
    }

    updateGame(dt: number) {
        if (this.game.t1 > this.xor.t1) return;
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.game = new GameLogic(this.xor.t1, this.initialSpeed);
            return;
        }
        if (this.game.life > 0 && !this.musicStarted && this.xor.sound.sampler.isStopped(0)) {
            this.xor.sound.sampler.playSample(2);
            this.musicStarted = true;
        } else if (this.game.life > 0 && this.xor.sound.sampler.isStopped(2)) {
            this.xor.sound.sampler.playSample(2);
            this.musicStarted = true;
        } else if (this.game.life <= 0 && this.musicStarted) {
            this.xor.sound.sampler.stopSample(2);
            this.musicStarted = false;
        }
        this.game.gameSpeed = this.initialSpeed;
        this.game.update(this.xor.t1, dt);

        if (this.grave && !this.lbsent) {
            this.postToLeaderboard();
        }
    }

    postToLeaderboard() {
        if (this.lbsent) return;
        if (window.location.href != "https://www.mfactorgames.com") return;
        this.lbsent = true;
        let gl = this.xor.fx.gl;
        let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "VENDOR";
        let renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "RENDERER";
        let xhr = new XMLHttpRequest();
        let url = "https://www.mfactorgames.com/games/ldjam44/leaderboard.php?add";
        url += "&bunnyName=TEST";
        url += "&totalDays=" + this.game.days.toFixed(2);
        url += "&totalWool=" + this.game.totalWool.toFixed(2);
        url += "&totalMoney=" + this.game.totalMoney.toFixed(2);
        url += "&dtg=" + new Date().toISOString();
        url += "&meta=" + vendor + " " + renderer;
        xhr.open("GET", url);
        xhr.addEventListener("load", (ev) => {
            hflog.info("LB got back => ", xhr.responseText)
        })
        xhr.send();
        alert(url);
    }

    updatePlayer(dt: number) {
        const turnSpeed = 5;
        const moveSpeed = 5;

        this.player.accelerations = [
            GTE.vec3(0.0, -9.8, 0.0),
        ];
        this.player.update(dt, this.constants);
        this.player.bound(-4.5, 4.5, 0.0, 2.0);

        if (this.game.life < 0) {
            if (!this.endMusicStarted) {
                this.endMusicStarted = true;
                this.xor.sound.sampler.stopSample(2);
                this.xor.sound.sampler.playSample(1);
            }
            let amount = GTE.clamp(this.game.life * 0.5, -6, 0);
            if (amount <= -3) {
                this.grave = true;
                amount = GTE.clamp(-6 + Math.abs(amount), -3, 0);
            }
            this.player.worldMatrix.translate(0, amount, 0);
        }
        if (this.gameStarted && this.game.life > 0) {

            let X0 = this.player.position;

            let turnY = -this.joyTurnY - this.joyMoveX;
            let moveZ = this.joyTurnX + this.joyMoveZ;

            if (this.xor.input.mouse.buttons) {
                turnY -= GTE.clamp(this.xor.input.mouse.delta.x, -1, 1);
                moveZ -= GTE.clamp(this.xor.input.mouse.delta.y, -1, 1);
                this.xor.input.mouse.delta.reset(0, 0);
            }

            let t = this.xor.input.touches[0];
            if (t.pressed) {
                if (Math.abs(t.touchDelta.x) > 30) {
                    turnY += GTE.clamp(t.touchDelta.x / 30, -1, 1);
                }
                if (Math.abs(t.touchDelta.y) > 30) {
                    moveZ -= GTE.clamp(t.touchDelta.y / 30, -1, 1);
                }
                t.dx = t.dx * dt * 0.9;
                t.dy = t.dy * dt * 0.9;
            }

            let speed = (1 + this.game.hayNutrition * this.game.watered + 3 * this.game.treatNutrition);
            turnY = GTE.clamp(turnY, -1, 1) * speed * turnSpeed;
            moveZ = GTE.clamp(moveZ, -1, 1) * speed;

            this.player.worldMatrix.rotate(turnSpeed * turnY * dt, 0, 1, 0);
            this.player.worldMatrix.translate(0, 0, moveZ * dt);
            this.player.x.reset();

            let X1 = this.player.position;

            this.game.exercise(X0.distance(X1));
        }
    }

    setMaterial(rc: Fluxions.FxRenderConfig, texture: string, uniform: string, unit: number) {
        rc.bindTextureUniform(uniform, texture, unit);
    }

    renderBar(mesh: Fluxions.FxIndexedGeometryMesh, value: number, color: number, x: number, w: number) {
        mesh.color3(this.xor.palette.calcColor(color, 0, 4, 0, 0, 0));
        mesh.rect(x, 0, x + 10, 100);
        mesh.color3(this.xor.palette.calcColor(color, 0, 0, 0, 0, 0));
        mesh.rect(x, 0, x + 10, value * 100);
    }

    rendergui() {
        let xor = this.xor;
        let mesh = new Fluxions.FxIndexedGeometryMesh(this.xor.fx);

        let w = 10;
        this.renderBar(mesh, this.game.hayNutrition, 15, w * 1, w);
        this.renderBar(mesh, this.game.pelletNutrition, 8, w * 2, w);
        this.renderBar(mesh, this.game.veggieNutrition, 5, w * 3, w);
        this.renderBar(mesh, this.game.treatNutrition, 7, w * 4, w);
        this.renderBar(mesh, this.game.watered, 9, w * 5, w);
        this.renderBar(mesh, this.game.curFur, 12, w * 6, w);
        this.renderBar(mesh, this.game.brushed, 11, w * 7, w);
        this.renderBar(mesh, this.game.cleaned, 14, w * 8, w);

        this.renderBar(mesh, this.game.life / (5 * 365), 4, xor.graphics.width - w * 2, w);
        this.renderBar(mesh, this.game.health * 0.5, 11, xor.graphics.width - w * 3, w);
        this.renderBar(mesh, this.game.exercised, 13, xor.graphics.width - w * 4, w);
        this.renderBar(mesh, this.game.woolQuality, 3, xor.graphics.width - w * 5, w);

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();
        let rc = xor.renderconfigs.use('gui');
        if (rc) {
            rc.fx.gl.disable(WebGLRenderingContext.DEPTH_TEST);
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
            if (this.grave) {
                let m = Matrix4.makeTranslation3(this.player.position);
                m.rotate(90, 0, 1, 0);
                rc.uniformMatrix4f('WorldMatrix', m);
                this.setMaterial(rc, "kamen", "FurTexture", -1);
                xor.meshes.render('tombstone', rc);
            } else {
                rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
                this.setMaterial(rc, "fur1", "FurTexture", -1);
                xor.meshes.render('bunny', rc);
            }
        }

        rc = xor.renderconfigs.use('fur');
        if (rc) {
            rc.uniform3f("sunDirTo", lmatrix.diag3());
            this.setMaterial(rc, "fur", "map_kd", -1);
            rc.uniform3f("kd", xor.palette.getColor(15));
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform1f("map_kd_mix", this.fKdMix);
            rc.uniform3f("kd", xor.palette.getColor(3));

            let m = Matrix4.makeTranslation3(this.player.x);
            rc.uniformMatrix4f('WorldMatrix', m);

            if (!this.grave) {
                rc.uniform1f("map_kd_mix", 1 - this.game.cleaned);
                for (let i = 0; i < this.iFurNumLayers; i++) {
                    let curLength = (i + 1) / (this.iFurNumLayers - 1);
                    let gravity = - 0.2 * (this.game.curFur * (1 - this.game.brushed));
                    let displacement = GTE.vec3(0.0, gravity, 0.0).add(GTE.vec3(0.01 * Math.sin(xor.t1 * 0.5), 0.0, 0.0));
                    rc.uniform1f("FurMaxLength", this.fFurMaxLength * (0.1 + 5.0 * this.game.curFur));
                    rc.uniform1f("FurCurLength", curLength);
                    rc.uniform3f("FurDisplacement", displacement);
                    rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
                    xor.meshes.render('bunnyshell', rc);
                }
            } else {
                rc.uniform1f("map_kd_mix", 1);
                rc.uniform1f("FurMaxLength", 0);
                rc.uniform1f("FurCurLength", 0);
                rc.uniform3f("FurDisplacement", GTE.vec3());
                let m = Matrix4.makeTranslation3(this.player.position);
                m.rotate(90, 0, 1, 0);
                rc.uniformMatrix4f('WorldMatrix', m);
                this.setMaterial(rc, "kamen", "map_kd", -1);
                // xor.meshes.render('tombstone', rc);
            }

        }
        xor.renderconfigs.use(null);

    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            let dt = Math.min(1 / 60, self.xor.dt);
            if (self.xor.dt > 0.033333) {
                self.iFurNumLayers = GTE.clamp(self.iFurNumLayers * 0.7, 25, 50) | 0;
            } else if (self.xor.dt < 0.017) {
                self.iFurNumLayers = GTE.clamp(self.iFurNumLayers * 1.05, 25, 50) | 0;
            }
            self.update(dt);
            self.render();
            self.rendergui();
            self.mainloop();
        });
    }

    /* Buttons from main page */

    setSpeed(speed: number) {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.initialSpeed = GTE.clamp(speed, 0.1, 100);
        this.game.gameSpeed = this.initialSpeed;
    }

    feedHay() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.feedHay();
    }

    feedPellets() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.feedPellets();
    }

    feedVeggies() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.feedVeggies();
    }

    feedTreats() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.feedTreats();
    }

    water() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.giveWater();
    }

    groom() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.groom();
        hflog.info("fur: " + this.game.curFur);
    }

    brushBunny() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.brushBunny();
    }

    cleanArea() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.cleanArea();
    }

    sell() {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.sell();
    }

    buyHay(x: number) {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.buyHay(x);
    }

    buyPellets(x: number) {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.buyPellets(x);
    }

    buyVeggies(x: number) {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.buyVeggies(x);
    }

    buyTreats(x: number) {
        if (!this.game || !this.gameStarted || this.grave) return;
        this.game.buyTreats(x);
    }
}

var game: GameApp;
var trystartfn: any;

game = new GameApp();

function start() {
    game.init();
    trystartfn = setInterval(() => {
        trystart();
    }, 250);
}

function trystart() {
    if (!game.loaded) {
        return;
    }
    clearInterval(trystartfn);
    game.start();
}
