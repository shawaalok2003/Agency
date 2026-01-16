/**
 * Simple Linear Regression Model
 * Logic: Ordinary Least Squares (OLS)
 * Goal: Predict y given x based on historical data.
 */

export type DataPoint = {
    x: number; // e.g., Month index (1, 2, 3...)
    y: number; // e.g., Revenue
};

export class LinearRegression {
    private slope: number = 0;
    private intercept: number = 0;
    private rSquared: number = 0;

    constructor(data: DataPoint[]) {
        this.train(data);
    }

    /**
     * Trains the model using OLS
     */
    private train(data: DataPoint[]) {
        const n = data.length;
        if (n === 0) return;

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (const point of data) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
        }

        // Calculate Slope (m)
        // m = (nΣ(xy) - ΣxΣy) / (nΣ(x^2) - (Σx)^2)
        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = (n * sumXX) - (sumX * sumX);

        if (denominator === 0) {
            this.slope = 0;
            this.intercept = 0;
            return;
        }

        this.slope = numerator / denominator;

        // Calculate Intercept (b)
        // b = (Σy - mΣx) / n
        this.intercept = (sumY - (this.slope * sumX)) / n;

        // Calculate R-Squared (Confidence)
        this.calculateRSquared(data, sumY / n);
    }

    private calculateRSquared(data: DataPoint[], meanY: number) {
        let ssTot = 0; // Total Sum of Squares
        let ssRes = 0; // Residual Sum of Squares

        for (const point of data) {
            const prediction = this.predict(point.x);
            ssTot += Math.pow(point.y - meanY, 2);
            ssRes += Math.pow(point.y - prediction, 2);
        }

        // R² = 1 - (ssRes / ssTot)
        this.rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
    }

    /**
     * Predicts y for a given x
     */
    public predict(x: number): number {
        return (this.slope * x) + this.intercept;
    }

    /**
     * Returns the model metadata
     */
    public getDetails() {
        return {
            slope: this.slope,
            intercept: this.intercept,
            rSquared: this.rSquared,
            formula: `y = ${this.slope.toFixed(2)}x + ${this.intercept.toFixed(2)}`
        };
    }
}
