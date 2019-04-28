function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

function smootherstep(x: number) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
}
