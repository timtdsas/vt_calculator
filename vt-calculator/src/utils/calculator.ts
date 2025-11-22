export interface SimulationResult {
    year: number;
    age: number;
    mean: number;
    median: number;
    p5: number; // -2 SD (approx 2.5%)
    p25: number; // -0.67 SD
    p75: number; // +0.67 SD
    p95: number; // +2 SD (approx 97.5%)
    // Standard Deviation Bands
    sd1_upper: number; // 84.1%
    sd1_lower: number; // 15.9%
    sd2_upper: number; // 97.7%
    sd2_lower: number; // 2.3%
    sd3_upper: number; // 99.87%
    sd3_lower: number; // 0.13%
}

export const calculateProjection = (
    currentAge: number,
    initialCapital: number,
    monthlyContribution: number,
    retirementAge: number
): SimulationResult[] => {
    const yearsToRetire = Math.max(0, retirementAge - currentAge);
    const numSimulations = 2000;
    const mu = 0.08; // Annual expected return
    const sigma = 0.15; // Annual volatility

    // Monthly parameters
    const monthlyMu = mu / 12;
    const monthlySigma = sigma / Math.sqrt(12);

    const results: SimulationResult[] = [];

    // Initialize simulations with initial capital
    let simulations = new Float64Array(numSimulations).fill(initialCapital);

    // Add year 0 (current state)
    results.push({
        year: new Date().getFullYear(),
        age: currentAge,
        mean: initialCapital,
        median: initialCapital,
        p5: initialCapital,
        p25: initialCapital,
        p75: initialCapital,
        p95: initialCapital,
        sd1_upper: initialCapital,
        sd1_lower: initialCapital,
        sd2_upper: initialCapital,
        sd2_lower: initialCapital,
        sd3_upper: initialCapital,
        sd3_lower: initialCapital,
    });

    for (let year = 1; year <= yearsToRetire; year++) {
        // Simulate 12 months for each year
        for (let month = 0; month < 12; month++) {
            for (let i = 0; i < numSimulations; i++) {
                // Geometric Brownian Motion for one month
                // r = (mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * Z
                // We use simplified monthly return: R = Normal(mu/12, sigma/sqrt(12))
                // Value = Value * (1 + R) + Contribution
                // Note: Log-normal is more accurate: Value = Value * exp( (mu - 0.5*sigma^2)/12 + sigma/sqrt(12) * Z )

                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

                const drift = (mu - 0.5 * sigma * sigma) / 12;
                const shock = monthlySigma * z;
                const monthlyReturn = Math.exp(drift + shock);

                simulations[i] = simulations[i] * monthlyReturn + monthlyContribution;
            }
        }

        // Sort to find percentiles
        const sorted = Float64Array.from(simulations).sort();

        const getPercentile = (p: number) => sorted[Math.floor(p * numSimulations)];

        const mean = simulations.reduce((a, b) => a + b, 0) / numSimulations;

        results.push({
            year: new Date().getFullYear() + year,
            age: currentAge + year,
            mean: mean,
            median: getPercentile(0.5),
            p5: getPercentile(0.05),
            p25: getPercentile(0.25),
            p75: getPercentile(0.75),
            p95: getPercentile(0.95),
            sd1_upper: getPercentile(0.8413),
            sd1_lower: getPercentile(0.1587),
            sd2_upper: getPercentile(0.9772),
            sd2_lower: getPercentile(0.0228),
            sd3_upper: getPercentile(0.9987),
            sd3_lower: getPercentile(0.0013),
        });
    }

    return results;
};
