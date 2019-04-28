class GameLogic {
    hayNutrition = 1.0;
    pelletNutrition = 1.0;
    veggieNutrition = 1.0;
    treatNutrition = 1.0;
    watered = 1.0;
    brushed = 1.0;
    cleaned = 1.0;
    exercised = 0.0;

    fur = 0.0;
    curFur = 0;
    maxFur = 5;
    wool = 0;
    woolQuality = 1.0;
    woolMarketBase = 13;
    woolMarket = 0;
    woolMarketValue = 0;

    // Life expectancy is 10 years
    // However, this could be shortened if not
    // treated well!
    life = 10.0 * 365;
    health = 1.0;
    hayUnits = 10;
    pelletUnits = 10;
    veggieUnits = 10;
    treatUnits = 10;

    hayCost = 1;
    pelletCost = 1;
    veggieCost = 1;
    treatCost = 1;

    money = 10.0;

    days = 0;
    t1 = 0;
    gameSpeed = 5;

    constructor(public t0: number) {
        this.t1 = t0;
    }

    update(t1: number, deltaTime: number) {
        if (t1 < this.t0) return;
        let dt = deltaTime * this.gameSpeed;
        this.t1 += dt;
        this.days = this.t1 - this.t0;

        let amount = 1 - smootherstep(this.curFur);
        let beforeFur = this.curFur;
        this.curFur = GTE.clamp(this.curFur + dt * amount / 90.0, 0, 1);
        this.fur = this.curFur * this.maxFur;

        this.health = GTE.clamp(
            this.hayNutrition * 0.7 +
            this.pelletNutrition * 0.2 +
            this.veggieNutrition * 0.1 +
            this.treatNutrition * 0.1 +
            this.watered +
            this.exercised, 0, 1);

        // diminish nutrition, water and exercise
        amount = 0.001 * this.gameSpeed * dt * Math.max(0.01, (3 - this.health));
        this.hayNutrition = GTE.clamp(this.hayNutrition - 0.7 * amount, 0, 1);
        this.pelletNutrition = GTE.clamp(this.pelletNutrition - 0.2 * amount, 0, 1);
        this.veggieNutrition = GTE.clamp(this.veggieNutrition - 0.1 * amount, 0, 1);
        this.treatNutrition = GTE.clamp(this.treatNutrition - 0.1 * amount, 0, 1);
        this.watered = GTE.clamp(this.watered - dt * amount, 0, 1);
        this.exercised = Math.max(0, this.exercised - dt * 0.5);

        // rabbits get dirty and matted
        let dirtify = dt * this.gameSpeed * (0.01 * this.exercised);
        this.brushed = GTE.clamp(this.brushed - dirtify, 0, 1);
        this.cleaned = GTE.clamp(this.cleaned - 0.55 * dirtify, 0, 1);

        // 2 - this.health means that we should
        // get about 10 years on this rabbit
        // if all is well! or 5 if not
        this.life -= dt * GTE.clamp(2 - smootherstep(this.health), 1, 2);

        this.woolQuality = this.brushed * this.cleaned;
        this.woolMarket += dt * this.woolQuality * (this.curFur - beforeFur);
        this.woolMarketValue = this.woolMarketBase * this.woolMarket;
    }

    exercise(distance: number) {
        this.exercised += distance;
    }

    groom() {
        let groomAmount = 0.1;
        let before = this.curFur;
        this.curFur = GTE.clamp(this.curFur - groomAmount, 0, 1);
        this.wool += this.maxFur * (before - this.curFur);
    }

    sell() {
        this.money += this.wool * this.woolMarketValue;
        this.wool = 0;
        this.woolMarket = 0;
    }

    giveWater() {
        this.watered = GTE.clamp(this.watered + 0.1, 0, 1);
    }

    feedHay() {
        let amount = Math.min(0.1, this.hayUnits);
        this.hayNutrition = GTE.clamp(this.hayNutrition + amount, 0, 1);
        this.hayUnits -= amount;
    }

    feedPellets() {
        let amount = Math.min(0.1, this.pelletUnits);
        this.pelletNutrition = GTE.clamp(this.pelletNutrition + amount, 0, 1);
        this.pelletUnits -= amount;
    }

    feedVeggies() {
        let amount = Math.min(0.1, this.veggieUnits);
        this.veggieNutrition = GTE.clamp(this.veggieNutrition + amount, 0, 1);
        this.veggieUnits -= amount;
    }

    feedTreats() {
        let amount = Math.min(0.1, this.treatUnits);
        this.treatNutrition = GTE.clamp(this.treatNutrition + amount, 0, 1);
        this.treatUnits -= amount;
    }

    brushBunny() {
        this.brushed = GTE.clamp(this.brushed + 0.1, 0, 1);
    }

    cleanArea() {
        this.cleaned = GTE.clamp(this.cleaned + 0.1, 0, 1);
    }
}
