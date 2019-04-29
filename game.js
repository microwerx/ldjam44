"use strict";
/* eslint-disable no-unused-vars */
/* global Vector3 */
// START HELPFUL HTML5 FUNCTIONS
/**
 * Creates a row div with a left and right column. It expects CSS class row, column, left, and right.
 * @param {string} leftContent
 * @param {string} rightContent
 */
function createRow(leftContent = "", rightContent = "") {
    let row = document.createElement('div');
    row.className = 'row';
    let left = document.createElement('div');
    left.className = 'column left';
    left.innerHTML = leftContent;
    let right = document.createElement('div');
    right.className = 'column right';
    right.innerHTML = rightContent;
    row.appendChild(left);
    row.appendChild(right);
    return row;
}
/**
 * createRangeRow creates a row with a range control
 * @param {HTMLElement} parent The element that should be appended to
 * @param {string} id The name of the range variable
 * @param {number} curValue The current value of the range
 * @param {number} minValue The minimum value of the range
 * @param {number} maxValue The maximum value of the range
 * @param {number} stepValue The step of the range control (default 1)
 * @returns {HTMLElement} The created HTMLElement div
 */
function createRangeRow(parent, id, curValue, minValue, maxValue, stepValue = 1, isvector = false) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    if (!isvector) {
        rContent += "<input type='range' id='" + id + "' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<label id='" + id + "_value'></label>";
    }
    else {
        rContent += "<input type='range' id='" + id + "1' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "2' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "3' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
    }
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createRowButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} caption The caption of the button
 * @param {string} id The name of the button's id
 * @param {function} callback A callback function if this gets clicked
 */
function createButtonRow(parent, id, caption, callback) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    rContent += "<button id='" + id + "'>" + caption + "</button>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
    let b = document.getElementById(id);
    if (b) {
        b.onclick = callback;
    }
}
/**
 * createCheckButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {boolean} checked Is it checked or not
 */
function createCheckRow(parent, id, checked) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    let c = checked ? " checked" : "";
    rContent += "<input type='checkbox' id='" + id + "' " + c + "/>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createDivButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 */
function createDivRow(parent, id) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right' id='" + id + "'>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * setDivRowContents
 * @param {string} id
 * @param {string} content
 */
function setDivRowContents(id, content) {
    let e = document.getElementById(id);
    if (!e)
        return;
    e.innerHTML = content;
}
/**
 * getRangeValue returns the number of a range control
 * @param {string} id
 * @returns {number} the value of the range control or 0
 */
function getRangeValue(id) {
    let e = document.getElementById(id);
    if (!e)
        return 0;
    let l = document.getElementById(id + "_value");
    if (l)
        l.innerHTML = e.value;
    return parseFloat(e.value) * 1.0;
}
/**
 * Returns if control is checked or not
 * @param {string} id
 * @returns {boolean}
 */
function getCheckValue(id) {
    let e = document.getElementById(id);
    if (!e)
        return false;
    return e.checked;
}
/**
 * getRangeVector3
 * @param {string} id The id of the range controls ending with 1, 2, 3. Example: id="sky", we get "sky1", "sky2", etc.
 * @returns {Vector3} A Vector3 with the values from controls id1, id2, and id3.
 */
function getRangeVector3(id) {
    return Vector3.make(getRangeValue(id + "1"), getRangeValue(id + "2"), getRangeValue(id + "3"));
}
/**
 * toggles HTML element visibility on or off
 * @param {string} id The id of the control to toggle on/off
 */
function toggle(id) {
    let e = document.getElementById(id);
    if (e) {
        e.style.display = e.style.display === 'none' ? '' : 'none';
    }
}
function setSpan(id, innerHTML) {
    let e = document.getElementById(id);
    if (e) {
        e.innerHTML = innerHTML;
    }
}
// END HELPFUL HTML5 CODE
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
function smootherstep(x) {
    if (x <= 0)
        return 0;
    if (x >= 1)
        return 1;
    return 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
}
class PhysicsObject {
    constructor() {
        this.accelerations = [];
        this.x = GTE.vec3(0, 0, 0);
        this.a = GTE.vec3(0, 0, 0);
        this.v = GTE.vec3(0, 0, 0);
        this.m = 62.0; // average human mass
        this.facingDirection = 0;
        this.bbox = new GTE.BoundingBox();
        this.worldMatrix = Matrix4.makeIdentity();
        this.bbox.add(GTE.vec3(-4.5, -4.5, 0.0));
        this.bbox.add(GTE.vec3(4.5, 4.5, 2.0));
    }
    reset(x, y, z) {
        this.worldMatrix.m14 = x;
        this.worldMatrix.m24 = y;
        this.worldMatrix.m34 = z;
    }
    /**
     * update(dt)
     * @param {number} dt time in seconds elapsed since the last call
     * @param {PhysicsConstants} constants standard constants for physics calculations
     */
    update(dt, constants) {
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
        this.v = GTE.vec3(0.5 * (this.v.x + this.a.x * dt + this.v.x), 0.5 * (this.v.y + this.a.y * dt + this.v.y), 0.5 * (this.v.z + this.a.z * dt + this.v.z));
        if (this.v.x < 0) {
            this.facingDirection = -1;
        }
        else if (this.v.x > 0) {
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
    bound(minx, maxx, miny, maxy) {
        this.x = this.worldMatrix.transform3(GTE.vec3());
        this.worldMatrix.translate(-this.x.x, -this.x.y, -this.x.z);
        this.x.x = GTE.clamp(this.x.x, minx, maxx);
        this.x.y = GTE.clamp(this.x.y, miny, maxy);
        this.x.z = GTE.clamp(this.x.z, minx, maxx);
        this.worldMatrix.m14 = this.x.x;
        this.worldMatrix.m24 = this.x.y;
        this.worldMatrix.m34 = this.x.z;
    }
    get position() {
        return this.worldMatrix.col3(3);
    }
}
class PhysicsConstants {
    constructor() {
        this.Mearth = 5.9722e24;
        this.Rearth = 6.3781e6;
        this.Rearth2 = 6.3781e6 * 6.3781e6;
        this.G = 6.674e-11;
        this.g = -this.Mearth * this.G / this.Rearth2;
        this.drag = 10.0;
        this.wind = 0.0;
    }
}
class GameLogic {
    constructor(t0, initialSpeed) {
        this.t0 = t0;
        this.hayNutrition = 1.0;
        this.pelletNutrition = 1.0;
        this.veggieNutrition = 1.0;
        this.treatNutrition = 1.0;
        this.watered = 1.0;
        this.brushed = 1.0;
        this.cleaned = 1.0;
        this.exercised = 1.0;
        this.fur = 0.0;
        this.curFur = 0;
        this.maxFur = 5;
        this.wool = 0;
        this.woolQuality = 1.0;
        this.woolMarketBase = 13;
        this.woolMarket = 0;
        this.woolMarketValue = 0;
        // Life expectancy is 10 years
        // However, this could be shortened if not
        // treated well!
        this.life = 10.0 * 365;
        this.health = 1.0;
        this.hayUnits = 10;
        this.pelletUnits = 10;
        this.veggieUnits = 10;
        this.treatUnits = 10;
        this.hayCost = 5;
        this.pelletCost = 3;
        this.veggieCost = 2;
        this.treatCost = 1;
        this.money = 50.0;
        this.totalWool = 0;
        this.totalWoolMoney = 0;
        this.totalMoney = 0;
        this.days = 0;
        this.t1 = 0;
        this.realTime = 0;
        this.gameSpeed = 3;
        this.t1 = t0;
        this.gameSpeed = initialSpeed;
    }
    update(t1, deltaTime) {
        if (t1 < this.t0)
            return;
        this.realTime += deltaTime;
        let dt = deltaTime * this.gameSpeed;
        this.t1 += dt;
        if (this.life > 0) {
            this.days += dt;
        }
        this.health = GTE.clamp(this.hayNutrition * 0.7 +
            this.pelletNutrition * 0.2 +
            this.veggieNutrition * 0.2 +
            this.treatNutrition * 0.1 +
            this.watered, 0, 2);
        const exerciseDays = 30;
        const waterDays = 30;
        const hayDays = 70;
        const pelletDays = 100;
        const veggieDays = 100;
        const treatDays = 30;
        const brushDays = 70;
        const cleanDays = 70;
        const furDays = 90;
        // diminish nutrition, water and exercise
        this.hayNutrition = GTE.clamp(this.hayNutrition - dt / hayDays, 0, 1);
        this.pelletNutrition = GTE.clamp(this.pelletNutrition - dt / pelletDays, 0, 1);
        this.veggieNutrition = GTE.clamp(this.veggieNutrition - dt / veggieDays, 0, 1);
        this.treatNutrition = GTE.clamp(this.treatNutrition - dt / treatDays, 0, 1);
        this.watered = GTE.clamp(this.watered - dt / waterDays, 0, 1);
        this.exercised = GTE.clamp(this.exercised - dt / exerciseDays, 0, 1);
        // rabbits get dirty and matted
        let dirtify = dt * (0.5 + this.exercised) / cleanDays;
        this.brushed = GTE.clamp(this.brushed - dirtify - dt / brushDays, 0, 1);
        this.cleaned = GTE.clamp(this.cleaned - 0.5 * dirtify - dt / cleanDays, 0, 1);
        // 2 - this.health means that we should
        // get about 10 years on this rabbit
        // if all is well! or 5 if not
        let waterPenalty = 180 * dt * ((this.watered < 0.05) ? 1 : 0);
        if (this.life > 0) {
            this.life -= dt * GTE.clamp(2 - this.health - 0.3 * this.exercised, 1, 2) + waterPenalty;
        }
        else {
            this.life -= 2 * dt;
            return;
        }
        // Fur growth is dependent on health, brushing, and cleanliness
        this.woolQuality = GTE.clamp(0.333 * (this.brushed * this.cleaned + this.health * this.cleaned + this.health * this.brushed), 0.5, 1);
        let amount = dt * this.woolQuality / furDays;
        let beforeFur = this.curFur;
        this.curFur = GTE.clamp(this.curFur + amount, 0, 1);
        this.fur = this.curFur * this.maxFur;
        this.woolMarket += 2 * this.woolQuality * (this.curFur - beforeFur);
        this.woolMarketValue = this.woolMarketBase * this.woolMarket;
    }
    exercise(distance) {
        this.exercised = GTE.clamp(this.exercised + distance, 0, 1);
    }
    groom() {
        let groomAmount = 0.1;
        let before = this.curFur;
        this.curFur = GTE.clamp(this.curFur - groomAmount, 0, 1);
        this.wool += this.maxFur * (before - this.curFur);
    }
    sell() {
        let profit = this.wool * this.woolMarketValue;
        this.money += profit;
        this.totalWool += this.wool;
        this.totalMoney += profit;
        this.wool = 0;
        this.woolMarket = 0;
    }
    giveWater() {
        this.watered = GTE.clamp(this.watered + 0.6, 0, 1);
    }
    feedHay() {
        let amount = Math.min(1, this.hayUnits);
        this.hayNutrition = GTE.clamp(this.hayNutrition + amount / 3, 0, 1);
        this.hayUnits -= amount;
    }
    feedPellets() {
        let amount = Math.min(1, this.pelletUnits);
        this.pelletNutrition = GTE.clamp(this.pelletNutrition + amount / 3, 0, 1);
        this.pelletUnits -= amount;
    }
    feedVeggies() {
        let amount = Math.min(1, this.veggieUnits);
        this.veggieNutrition = GTE.clamp(this.veggieNutrition + amount / 3, 0, 1);
        this.veggieUnits -= amount;
    }
    feedTreats() {
        let amount = Math.min(1, this.treatUnits);
        this.treatNutrition = GTE.clamp(this.treatNutrition + amount / 3, 0, 1);
        this.treatUnits -= amount;
    }
    brushBunny() {
        this.brushed = GTE.clamp(this.brushed + 0.20, 0.0, 1);
    }
    cleanArea() {
        this.cleaned = GTE.clamp(this.cleaned + 0.20, 0.0, 1);
    }
    buyHay(x) {
        let available = this.money / this.hayCost;
        let count = Math.min(available, x);
        this.money -= count * this.hayCost;
        this.hayUnits += count;
    }
    buyPellets(x) {
        let available = this.money / this.pelletCost;
        let count = Math.min(available, x);
        this.money -= count * this.pelletCost;
        this.pelletUnits += count;
    }
    buyVeggies(x) {
        let available = this.money / this.veggieCost;
        let count = Math.min(available, x);
        this.money -= count * this.veggieCost;
        this.veggieUnits += count;
    }
    buyTreats(x) {
        let available = this.money / this.treatCost;
        let count = Math.min(available, x);
        this.money -= count * this.treatCost;
        this.treatUnits += count;
    }
}
/// <reference path="../../LibXOR/LibXOR.d.ts" />
/// <reference path="htmlutils.ts" />
/// <reference path="math.ts" />
/// <reference path="PhysicsObject.ts" />
/// <reference path="PhysicsConstants.ts" />
/// <reference path="GameLogic.ts" />
class GameApp {
    constructor() {
        // controls
        this.zqsd = false;
        this.joyMoveX = 0.0;
        this.joyMoveY = 0.0;
        this.joyMoveZ = 0.0;
        this.joyTurnZ = 0.0;
        this.joyTurnY = 0.0;
        this.joyTurnX = 0.0;
        this.joyMove = new Vector3();
        this.joyTurn = new Vector3();
        this.anybutton = 0.0;
        this.b0 = 0.0;
        this.b1 = 0.0;
        this.b2 = 0.0;
        this.b3 = 0.0;
        this.grave = false;
        this.gameStarted = false;
        this.initialSpeed = 3;
        // camera view
        this.cameraCenter = new Vector3(0, 0, 0);
        this.cameraZoom = 1.0;
        this.cameraAzimuth = 0.0;
        this.sunAz = 45.0;
        this.sunPitch = 45.0;
        // fur controls
        this.iFurNumLayers = 50;
        this.fFurMaxLength = 0.1;
        this.fKdMix = 0.5;
        this.fFurGravity = 0.0;
        // sound
        this.musicStarted = false;
        this.endMusicStarted = false;
        this.xor = new LibXOR("project");
        this.player = new PhysicsObject();
        this.parrot = new PhysicsObject();
        this.constants = new PhysicsConstants();
    }
    get loaded() {
        if (!this.xor.textfiles.loaded)
            return false;
        else if (!this.xor.fx.textures.loaded)
            return false;
        else if (!this.xor.sound.sampler.loaded)
            return false;
        return true;
    }
    init() {
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
    }
    initControls() {
        let c = document.getElementById('controls');
        if (!c)
            return;
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
        setSpan("totalMoney", this.game.money.toFixed(2));
        setSpan("totalDays", this.game.days.toFixed(2) + "/" + this.game.totalWool.toFixed(2) + "oz" + "/" + this.game.totalMoney.toFixed(2));
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
    updateInput(xor) {
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
        if (xor.input.checkKeys(negMoveXKeys))
            this.joyMoveX -= 1.0;
        if (xor.input.checkKeys(posMoveXKeys))
            this.joyMoveX += 1.0;
        if (xor.input.checkKeys(negMoveZKeys))
            this.joyMoveZ -= 1.0;
        if (xor.input.checkKeys(posMoveZKeys))
            this.joyMoveZ += 1.0;
        if (xor.input.checkKeys(negMoveYKeys))
            this.joyMoveY -= 1.0;
        if (xor.input.checkKeys(posMoveYKeys))
            this.joyMoveY += 1.0;
        if (xor.input.checkKeys(negTurnXKeys))
            this.joyTurnX -= 1.0;
        if (xor.input.checkKeys(posTurnXKeys))
            this.joyTurnX += 1.0;
        if (xor.input.checkKeys(negTurnYKeys))
            this.joyTurnY -= 1.0;
        if (xor.input.checkKeys(posTurnYKeys))
            this.joyTurnY += 1.0;
        if (xor.input.checkKeys(negTurnZKeys))
            this.joyTurnZ -= 1.0;
        if (xor.input.checkKeys(posTurnZKeys))
            this.joyTurnZ += 1.0;
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
    update(dt) {
        let xor = this.xor;
        if (!this.loaded)
            return;
        this.syncControls();
        this.updateInput(xor);
        this.updatePlayer(dt);
        this.updateGame();
        this.syncLabels();
        //this.cameraAzimuth += this.joyTurnY * dt * 25;
    }
    reset() {
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
        // reset audio
        this.xor.sound.sampler.stopSample(0);
        this.xor.sound.sampler.stopSample(1);
        this.xor.sound.sampler.stopSample(2);
        this.xor.sound.sampler.playSample(0);
    }
    updateGame() {
        if (this.game.t1 > this.xor.t1)
            return;
        // if (this.xor.sound.sampler.isPlaying(0) && this.) return;
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.game = new GameLogic(this.xor.t1, this.initialSpeed);
            this.xor.sound.sampler.playSample(2);
            //this.xor.sound.sampler.playSample(3);
            return;
        }
        if (this.game.life > 0 && this.xor.sound.sampler.isStopped(2)) {
            this.xor.sound.sampler.playSample(2);
            this.musicStarted = true;
        }
        this.game.update(this.xor.t1, this.xor.dt);
    }
    updatePlayer(dt) {
        const turnSpeed = 50;
        const moveSpeed = 5;
        this.player.accelerations = [
            GTE.vec3(0.0, -this.joyMoveZ * this.constants.g * 2, 0.0),
            GTE.vec3(0.0 * this.joyMoveX * 10.0, 0.0, 0.0),
        ];
        this.player.update(dt, this.constants);
        this.player.bound(-4.5, 4.5, 0.0, 2.0);
        if (this.game.life < 0) {
            if (!this.endMusicStarted) {
                this.endMusicStarted = true;
                this.xor.sound.sampler.stopSample(2);
                this.xor.sound.sampler.playSample(1);
            }
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
        turnY = GTE.clamp(turnY, -1, 1) * speed;
        moveZ = GTE.clamp(moveZ, -1, 1) * speed;
        this.player.worldMatrix.rotate(turnSpeed * turnY * dt, 0, 1, 0);
        this.player.worldMatrix.translate(0, 0, moveZ * dt);
        this.player.x.reset();
        let X1 = this.player.position;
        this.game.exercise(X0.distance(X1));
    }
    setMaterial(rc, texture, uniform, unit) {
        rc.bindTextureUniform(uniform, texture, unit);
    }
    renderBar(mesh, value, color, x, w) {
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
        this.renderBar(mesh, this.game.brushed, 11, w * 8, w);
        this.renderBar(mesh, this.game.cleaned, 14, w * 7, w);
        this.renderBar(mesh, this.game.life / (5 * 365), 4, xor.graphics.width - w * 2, w);
        this.renderBar(mesh, this.game.health, 11, xor.graphics.width - w * 3, w);
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
            }
            else {
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
                    let gravity = 0.1 * (this.game.curFur * this.game.brushed); //-this.fFurGravity;
                    let displacement = GTE.vec3(0.0, gravity, 0.0).add(GTE.vec3(0.01 * Math.sin(xor.t1 * 0.5), 0.0, 0.0));
                    rc.uniform1f("FurMaxLength", this.fFurMaxLength * (0.1 + this.game.fur));
                    rc.uniform1f("FurCurLength", curLength);
                    rc.uniform3f("FurDisplacement", displacement);
                    rc.uniformMatrix4f('WorldMatrix', this.player.worldMatrix);
                    xor.meshes.render('bunnyshell', rc);
                }
            }
            else {
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
            let dt = Math.min(0.016666, self.xor.dt);
            if (self.xor.dt > 0.033333) {
                this.iFurNumLayers = GTE.clamp(this.iFurNumLayers * 0.7, 25, 50);
            }
            else if (self.xor.dt < 0.017) {
                this.iFurNumLayers = GTE.clamp(this.iFurNumLayers * 1.05, 25, 50);
            }
            self.update(dt);
            self.render();
            self.rendergui();
            self.mainloop();
        });
    }
    /* Buttons from main page */
    setSpeed(speed) {
        if (!this.game)
            return;
        this.initialSpeed = GTE.clamp(speed, 0.1, 100);
        this.game.gameSpeed = this.initialSpeed;
    }
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
    buyHay(x) {
        this.game.buyHay(x);
    }
    buyPellets(x) {
        this.game.buyPellets(x);
    }
    buyVeggies(x) {
        this.game.buyVeggies(x);
    }
    buyTreats(x) {
        this.game.buyTreats(x);
    }
}
var game;
var trystartfn;
function start() {
    game = new GameApp();
    game.init();
    // toggle('gamecontrols');
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
// toggle('gamecontrols');
//# sourceMappingURL=game.js.map