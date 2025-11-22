import { useState, useMemo } from 'react'
import { calculateProjection } from './utils/calculator'
import { PremiumChart } from './components/Chart'

function App() {
    // Inputs
    const [age, setAge] = useState<number>(30)
    const [initialCapital, setInitialCapital] = useState<number>(10000)
    const [monthlyContribution, setMonthlyContribution] = useState<number>(1000)
    const [retirementAge, setRetirementAge] = useState<number>(65)

    // Toggles
    const [showMedian, setShowMedian] = useState(true)
    const [showMean, setShowMean] = useState(false)
    const [showSD1, setShowSD1] = useState(true)
    const [showSD2, setShowSD2] = useState(false)
    const [showSD3, setShowSD3] = useState(false)

    // Derived Data
    const data = useMemo(() => {
        return calculateProjection(age, initialCapital, monthlyContribution, retirementAge)
    }, [age, initialCapital, monthlyContribution, retirementAge])

    return (
        <div className="min-h-screen p-4 md:p-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400"
                    style={{
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8)'
                    }}>
                    Global Index Fund (VT)
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Visualize the power of long-term compounding with a globally diversified portfolio.
                </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Controls Section */}
                <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6 text-sky-400" style={{ color: '#38bdf8', marginBottom: '1.5rem' }}>Your Profile</h2>

                        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label>Current Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <div>
                                <label>Initial Capital ($)</label>
                                <input
                                    type="number"
                                    value={initialCapital}
                                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                                    min={0}
                                    step={1000}
                                />
                            </div>

                            <div>
                                <label>Monthly Contribution ($)</label>
                                <input
                                    type="number"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                    min={0}
                                    step={100}
                                />
                            </div>

                            <div>
                                <label>Retirement Age</label>
                                <input
                                    type="number"
                                    value={retirementAge}
                                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                                    min={age + 1}
                                    max={100}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6 text-indigo-400" style={{ color: '#818cf8', marginBottom: '1.5rem' }}>Chart Options</h2>

                        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Toggle label="Show Median (50%)" checked={showMedian} onChange={setShowMedian} color="#38bdf8" />
                            <Toggle label="Show Mean (Average)" checked={showMean} onChange={setShowMean} color="#4ade80" />
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                            <Toggle label="Show ±1 SD (68%)" checked={showSD1} onChange={setShowSD1} color="#38bdf8" />
                            <Toggle label="Show ±2 SD (95%)" checked={showSD2} onChange={setShowSD2} color="#fbbf24" />
                            <Toggle label="Show ±3 SD (99.7%)" checked={showSD3} onChange={setShowSD3} color="#f87171" />
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="lg:col-span-2" style={{ gridColumn: 'span 2' }}>
                    <div className="card h-full" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex justify-between items-end mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className="text-2xl font-bold">Projected Wealth</h2>
                                <p className="text-slate-400 text-sm">Monte Carlo Simulation (2000 runs)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-400">At Age {retirementAge}</p>
                                <p className="text-3xl font-bold text-sky-400">
                                    ${(data[data.length - 1]?.median / 1000000).toFixed(2)}M
                                </p>
                                <p className="text-xs text-slate-500">Median Outcome</p>
                            </div>
                        </div>

                        <div style={{ flex: 1, minHeight: '400px' }}>
                            <PremiumChart
                                data={data}
                                showMean={showMean}
                                showMedian={showMedian}
                                showSD1={showSD1}
                                showSD2={showSD2}
                                showSD3={showSD3}
                            />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

const Toggle = ({ label, checked, onChange, color }: { label: string, checked: boolean, onChange: (v: boolean) => void, color: string }) => (
    <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: checked ? color : '#94a3b8', transition: 'color 0.2s' }}>{label}</span>
        <label className="switch" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className="slider"></span>
        </label>
    </div>
)

export default App
