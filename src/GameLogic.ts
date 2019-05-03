class GameLogic {
    hayNutrition = 1.0;
    pelletNutrition = 1.0;
    veggieNutrition = 1.0;
    treatNutrition = 1.0;
    watered = 1.0;
    brushed = 1.0;
    cleaned = 1.0;
    exercised = 1.0;

    fur = 0.0;
    curFur = 0;
    maxFur = 16;
    woolInOunces = 0;
    groomedWoolInOunces = 0;
    woolQuality = 1.0;
    woolMarketBaseRate = 13;
    woolValueAtMarket = 0;
    woolAverageValue = 0;
    groomedAverageValue = 0;

    // Life expectancy is 10 years
    // However, this could be shortened if not
    // treated well!
    life = 10.0 * 365;
    health = 1.0;

    hayUnits = 10;
    pelletUnits = 10;
    veggieUnits = 10;
    treatUnits = 10;

    hayCost = 3;
    pelletCost = 3;
    veggieCost = 2;
    treatCost = 1;

    money = 50.0;

    totalWool = 0;
    totalWoolMoney = 0;
    totalMoney = 0;
    days = 0;
    t1 = 0;
    realTime = 0;
    gameSpeed = 3;

    constructor(public t0: number, initialSpeed: number) {
        this.t1 = t0;
        this.gameSpeed = initialSpeed;
    }

    update(t1: number, deltaTime: number) {
        if (t1 < this.t0) return;
        this.realTime += deltaTime;
        let dt = deltaTime * this.gameSpeed;
        this.t1 += dt;
        if (this.life > 0) {
            this.days += dt;
        } else {
            this.life -= 2 * deltaTime;
            return;
        }

        this.health = GTE.clamp(
            this.hayNutrition * 0.7 +
            this.pelletNutrition * 0.2 +
            this.veggieNutrition * 0.2 +
            this.treatNutrition * 0.1 +
            this.watered,
            0, 2);

        const exerciseDays = 10;
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
            this.life = GTE.clamp(this.life, -0.001, 1e6);
        }

        // Fur growth is dependent on health, brushing, and cleanliness
        this.woolQuality = GTE.clamp(0.333 * (this.brushed * this.cleaned + this.health * this.cleaned + this.health * this.brushed), 0.5, 1);
        let amount = dt * this.woolQuality / furDays;
        let beforeFur = this.curFur;
        this.curFur = GTE.clamp(this.curFur + amount, 0, 1);
        this.fur = this.curFur * this.maxFur;
        // OLD
        // this.woolValueAtMarket += this.woolQuality * (this.curFur - beforeFur);
        // this.woolAverageValue = this.woolMarketBaseRate * this.woolValueAtMarket;
        // NEW
        this.woolMarketBaseRate = Math.sin(this.days / 100.0) + 13;
        this.woolInOunces += (this.curFur - beforeFur) * this.maxFur;        
        // this.woolValueAtMarket += this.woolMarketBaseRate * (0.05 + this.woolQuality) * (this.curFur - beforeFur);
        let woolTotal = this.woolInOunces + this.groomedWoolInOunces;
        this.woolAverageValue = this.woolMarketBaseRate * (0.05 + this.woolQuality);
        this.groomedAverageValue = this.groomedWoolInOunces <= 0.1 ? 0 : this.woolValueAtMarket / this.groomedWoolInOunces;
    }

    exercise(distance: number) {
        this.exercised = GTE.clamp(this.exercised + GTE.clamp(distance, 0, 1) / 10, 0, 1);
    }

    groom() {
        let groomAmount = 0.1;
        let before = this.curFur;
        this.curFur = GTE.clamp(this.curFur - groomAmount, 0, 1);
        let diff = this.maxFur * (before - this.curFur);
        this.groomedWoolInOunces += diff;
        this.woolInOunces -= diff;
        this.woolValueAtMarket += this.woolAverageValue * diff;
    }

    sell() {
        // let profit = this.woolInOunces * this.woolAverageValue;
        this.money += this.woolValueAtMarket;
        this.totalWool += this.groomedWoolInOunces;
        this.totalMoney += this.woolValueAtMarket;
        this.groomedWoolInOunces = 0;
        this.woolValueAtMarket = 0;
    }

    giveWater() {
        this.watered = GTE.clamp(this.watered + 0.6, 0, 1);
    }

    feedHay() {
        let amount = Math.min(1, this.hayUnits);
        this.hayNutrition = GTE.clamp(this.hayNutrition + amount/3, 0, 1);
        this.hayUnits -= amount;
    }

    feedPellets() {
        let amount = Math.min(1, this.pelletUnits);
        this.pelletNutrition = GTE.clamp(this.pelletNutrition + amount/3, 0, 1);
        this.pelletUnits -= amount;
    }

    feedVeggies() {
        let amount = Math.min(1, this.veggieUnits);
        this.veggieNutrition = GTE.clamp(this.veggieNutrition + amount/3, 0, 1);
        this.veggieUnits -= amount;
    }

    feedTreats() {
        let amount = Math.min(1, this.treatUnits);
        this.treatNutrition = GTE.clamp(this.treatNutrition + amount/3, 0, 1);
        this.treatUnits -= amount;
    }

    brushBunny() {
        this.brushed = GTE.clamp(this.brushed + 0.20, 0.0, 1);
    }

    cleanArea() {
        this.cleaned = GTE.clamp(this.cleaned + 0.20, 0.0, 1);
    }

    buyHay(x: number) {
        let available = this.money / this.hayCost;
        let count = Math.min(available, x);
        this.money -= count * this.hayCost;
        this.hayUnits += count;
    }

    buyPellets(x: number) {
        let available = this.money / this.pelletCost;
        let count = Math.min(available, x);
        this.money -= count * this.pelletCost;
        this.pelletUnits += count;
    }

    buyVeggies(x: number) {
        let available = this.money / this.veggieCost;
        let count = Math.min(available, x);
        this.money -= count * this.veggieCost;
        this.veggieUnits += count;
    }

    buyTreats(x: number) {
        let available = this.money / this.treatCost;
        let count = Math.min(available, x);
        this.money -= count * this.treatCost;
        this.treatUnits += count;
    }
}
