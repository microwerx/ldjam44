/// <reference path="../LibXOR/LibXOR.d.ts" />
/**
 * Creates a row div with a left and right column. It expects CSS class row, column, left, and right.
 * @param {string} leftContent
 * @param {string} rightContent
 */
declare function createRow(leftContent?: string, rightContent?: string): HTMLDivElement;
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
declare function createRangeRow(parent: HTMLElement, id: string, curValue: number, minValue: number, maxValue: number, stepValue?: number, isvector?: boolean): void;
/**
 * createRowButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} caption The caption of the button
 * @param {string} id The name of the button's id
 * @param {function} callback A callback function if this gets clicked
 */
declare function createButtonRow(parent: HTMLElement, id: string, caption: string, callback: any): void;
/**
 * createCheckButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {boolean} checked Is it checked or not
 */
declare function createCheckRow(parent: HTMLElement, id: string, checked: boolean): void;
/**
 * createDivButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 */
declare function createDivRow(parent: HTMLElement, id: string): void;
/**
 * setDivRowContents
 * @param {string} id
 * @param {string} content
 */
declare function setDivRowContents(id: string, content: string): void;
/**
 * getRangeValue returns the number of a range control
 * @param {string} id
 * @returns {number} the value of the range control or 0
 */
declare function getRangeValue(id: string): number;
/**
 * Returns if control is checked or not
 * @param {string} id
 * @returns {boolean}
 */
declare function getCheckValue(id: string): boolean;
/**
 * getRangeVector3
 * @param {string} id The id of the range controls ending with 1, 2, 3. Example: id="sky", we get "sky1", "sky2", etc.
 * @returns {Vector3} A Vector3 with the values from controls id1, id2, and id3.
 */
declare function getRangeVector3(id: string): Vector3;
/**
 * toggles HTML element visibility on or off
 * @param {string} id The id of the control to toggle on/off
 */
declare function toggle(id: string): void;
declare function setSpan(id: string, innerHTML: string): void;
declare function sigmoid(x: number): number;
declare function smootherstep(x: number): number;
declare class PhysicsObject {
    accelerations: Vector3[];
    x: Vector3;
    a: Vector3;
    v: Vector3;
    m: number;
    facingDirection: number;
    bbox: GTE.BoundingBox;
    worldMatrix: Matrix4;
    constructor();
    reset(x: number, y: number, z: number): void;
    /**
     * update(dt)
     * @param {number} dt time in seconds elapsed since the last call
     * @param {PhysicsConstants} constants standard constants for physics calculations
     */
    update(dt: number, constants: PhysicsConstants): void;
    /**
     *
     * @param {number} minx minimum x world coordinates
     * @param {number} maxx maximum x world coordinates
     * @param {number} miny minimum y world coordinates
     * @param {number} maxy maximum y world coordinates
     */
    bound(minx: number, maxx: number, miny: number, maxy: number): void;
    readonly position: Vector3;
}
declare class PhysicsConstants {
    Mearth: number;
    Rearth: number;
    Rearth2: number;
    G: number;
    g: number;
    drag: number;
    wind: number;
    constructor();
}
declare class GameLogic {
    t0: number;
    hayNutrition: number;
    pelletNutrition: number;
    veggieNutrition: number;
    treatNutrition: number;
    watered: number;
    brushed: number;
    cleaned: number;
    exercised: number;
    fur: number;
    curFur: number;
    maxFur: number;
    wool: number;
    woolQuality: number;
    woolMarketBase: number;
    woolMarket: number;
    woolMarketValue: number;
    life: number;
    health: number;
    hayUnits: number;
    pelletUnits: number;
    veggieUnits: number;
    treatUnits: number;
    hayCost: number;
    pelletCost: number;
    veggieCost: number;
    treatCost: number;
    money: number;
    totalWool: number;
    totalWoolMoney: number;
    totalMoney: number;
    days: number;
    t1: number;
    realTime: number;
    gameSpeed: number;
    constructor(t0: number, initialSpeed: number);
    update(t1: number, deltaTime: number): void;
    exercise(distance: number): void;
    groom(): void;
    sell(): void;
    giveWater(): void;
    feedHay(): void;
    feedPellets(): void;
    feedVeggies(): void;
    feedTreats(): void;
    brushBunny(): void;
    cleanArea(): void;
    buyHay(x: number): void;
    buyPellets(x: number): void;
    buyVeggies(x: number): void;
    buyTreats(x: number): void;
}
declare class GameApp {
    xor: LibXOR;
    zqsd: boolean;
    joyMoveX: number;
    joyMoveY: number;
    joyMoveZ: number;
    joyTurnZ: number;
    joyTurnY: number;
    joyTurnX: number;
    joyMove: Vector3;
    joyTurn: Vector3;
    anybutton: number;
    b0: number;
    b1: number;
    b2: number;
    b3: number;
    game: GameLogic;
    grave: boolean;
    gameStarted: boolean;
    initialSpeed: number;
    readonly loaded: boolean;
    cameraCenter: Vector3;
    cameraZoom: number;
    cameraAzimuth: number;
    sunAz: number;
    sunPitch: number;
    iFurNumLayers: number;
    fFurMaxLength: number;
    fKdMix: number;
    fFurGravity: number;
    musicStarted: boolean;
    endMusicStarted: boolean;
    player: PhysicsObject;
    parrot: PhysicsObject;
    constants: PhysicsConstants;
    constructor();
    init(): void;
    initControls(): void;
    syncControls(): void;
    syncLabels(): void;
    start(): void;
    updateInput(xor: LibXOR): void;
    update(dt: number): void;
    reset(): void;
    updateGame(dt: number): void;
    updatePlayer(dt: number): void;
    setMaterial(rc: Fluxions.FxRenderConfig, texture: string, uniform: string, unit: number): void;
    renderBar(mesh: Fluxions.FxIndexedGeometryMesh, value: number, color: number, x: number, w: number): void;
    rendergui(): void;
    render(): void;
    mainloop(): void;
    setSpeed(speed: number): void;
    feedHay(): void;
    feedPellets(): void;
    feedVeggies(): void;
    feedTreats(): void;
    water(): void;
    groom(): void;
    brushBunny(): void;
    cleanArea(): void;
    sell(): void;
    buyHay(x: number): void;
    buyPellets(x: number): void;
    buyVeggies(x: number): void;
    buyTreats(x: number): void;
}
declare var game: GameApp;
declare var trystartfn: any;
declare function start(): void;
declare function trystart(): void;
