import React, { useState, useMemo } from 'react';
import SupplyChainAvatar from './components/SupplyChainAvatar';

// --- Type Definitions for TypeScript ---
interface CostItem {
    value: string;
    currency: string;
}

interface WeatherData {
    temperature: number;
    windSpeed: number;
    waveHeight: number;
    visibility: number;
    stormRisk: 'low' | 'medium' | 'high';
    delayRisk: number;
    route: string;
    timestamp: string;
}

interface RouteWeatherAssessment {
    route: string;
    currentConditions: WeatherData;
    forecast: WeatherData[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendedAction: string;
    estimatedDelay: number;
    costImpact: number;
}

interface ShipmentDetails {
    client: string;
    pol: string;
    pod: string;
    shippingLine: string;
    containerSize: string;
    commodity: string;
    incoterm: string;
}

interface ExchangeRates {
    usd: string;
    eur: string;
    gbp: string;
}

interface Costs {
    freight: { [key: string]: CostItem };
    origin: { [key: string]: CostItem };
    saPort: { [key: string]: CostItem };
    clearing: { [key: string]: CostItem };
    transport: { [key: string]: CostItem };
    landedCost: { [key: string]: string };
}

// --- Component Prop Types ---
interface CostSectionProps {
    title: string;
    costData: { [key: string]: CostItem };
    sectionName: keyof Omit<Costs, 'landedCost'>;
    handleCostChange: (section: keyof Omit<Costs, 'landedCost'>, field: string, value: CostItem) => void;
    currencyOptions: string[];
    hasPercentage?: boolean;
}

interface InputFieldProps {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: readonly string[];
}


// --- Helper Functions & Constants ---
const formatCurrency = (value: string | number, currency: string = 'ZAR') => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0);
    }
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue);
};

const PICK_LISTS = {
    ports: ['Shanghai', 'Ningbo', 'Qingdao', 'Singapore', 'Rotterdam', 'Hamburg', 'Los Angeles', 'Durban', 'Cape Town', 'Gqeberha'] as const,
    shippingLines: ['Maersk', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd'] as const,
    containerSizes: ["20' GP", "40' GP", "40' HC", "20' OT", "40' OT", "20' FR", "40' FR"] as const,
    incoterms: ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as const,
};

const VAT_RATE = 0.15; // 15% VAT

// Weather Intelligence API Service
const getRouteWeatherData = async (pol: string, pod: string): Promise<RouteWeatherAssessment> => {
    // Mock weather data for demonstration
    const mockWeatherData: WeatherData = {
        temperature: 22,
        windSpeed: 15,
        waveHeight: 2.5,
        visibility: 8,
        stormRisk: 'medium',
        delayRisk: 0.25,
        route: `${pol} → ${pod}`,
        timestamp: new Date().toISOString()
    };

    const mockForecast: WeatherData[] = Array.from({ length: 7 }, (_, i) => ({
        ...mockWeatherData,
        temperature: mockWeatherData.temperature + (Math.random() - 0.5) * 10,
        windSpeed: mockWeatherData.windSpeed + (Math.random() - 0.5) * 20,
        waveHeight: mockWeatherData.waveHeight + (Math.random() - 0.5) * 2,
        delayRisk: Math.random() * 0.4,
        timestamp: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString()
    }));

    const avgDelayRisk = mockForecast.reduce((sum, data) => sum + data.delayRisk, 0) / mockForecast.length;
    const riskLevel: 'low' | 'medium' | 'high' = avgDelayRisk > 0.3 ? 'high' : avgDelayRisk > 0.15 ? 'medium' : 'low';
    
    return {
        route: `${pol} → ${pod}`,
        currentConditions: mockWeatherData,
        forecast: mockForecast,
        riskLevel,
        recommendedAction: riskLevel === 'high' ? 'Consider alternative routing' : 
                          riskLevel === 'medium' ? 'Monitor conditions closely' : 'Proceed as planned',
        estimatedDelay: avgDelayRisk * 3, // days
        costImpact: avgDelayRisk * 2500 // ZAR
    };
};

const calculateWeatherAdjustment = (baseFreight: number, weatherAssessment: RouteWeatherAssessment): number => {
    const riskMultiplier = {
        low: 1.0,
        medium: 1.05,
        high: 1.15
    };
    
    return baseFreight * riskMultiplier[weatherAssessment.riskLevel];
};

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [currentView, setCurrentView] = useState<'calculator' | 'avatar' | 'weather'>('calculator');
    const [weatherAssessment, setWeatherAssessment] = useState<RouteWeatherAssessment | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>({
        client: 'ABC Importers',
        pol: 'Shanghai',
        pod: 'Durban',
        shippingLine: 'Maersk',
        containerSize: "40' HC",
        commodity: 'General Goods',
        incoterm: 'FOB',
    });

    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
        usd: '18.50',
        eur: '20.20',
        gbp: '23.50',
    });

    const [costs, setCosts] = useState<Costs>({
        freight: {
            seaFreight: { value: '2500', currency: 'usd' },
            peakSeasonSurcharge: { value: '0', currency: 'usd' },
            bunkerSurcharge: { value: '300', currency: 'usd' },
            adminFee: { value: '50', currency: 'usd' },
        },
        origin: {
            thc: { value: '150', currency: 'usd' },
            documentation: { value: '75', currency: 'usd' },
            cartage: { value: '0', currency: 'usd' },
            exportCustoms: { value: '100', currency: 'usd' },
        },
        saPort: {
            portCharges: { value: '1500', currency: 'zar' },
            navigationalDues: { value: '800', currency: 'zar' },
            thc: { value: '2800', currency: 'zar' },
            storage: { value: '0', currency: 'zar' },
        },
        clearing: {
            agencyFee: { value: '1850', currency: 'zar' },
            customsClearance: { value: '950', currency: 'zar' },
            documentation: { value: '450', currency: 'zar' },
            samsa: { value: '250', currency: 'zar' },
        },
        transport: {
            fuelSurcharge: { value: '15', currency: 'percent' },
            cartage: { value: '4500', currency: 'zar' },
            wharfage: { value: '0', currency: 'zar' },
        },
        landedCost: {
            commercialInvoiceValue: '15000',
            dutyRate: '5',
            units: '1000',
        }
    });

    // --- Event Handlers ---
    const handleCostStateChange = (section: keyof Omit<Costs, 'landedCost'>, field: string, value: CostItem) => {
        setCosts(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                [field]: value
            }
        }));
    };

    const handleLandedCostChange = (field: string, value: string) => {
        setCosts(prevState => ({
            ...prevState,
            landedCost: {
                ...prevState.landedCost,
                [field]: value
            }
        }))
    }
    
    const handleDetailChange = <T,>(setState: React.Dispatch<React.SetStateAction<T>>, field: keyof T, value: string) => {
        setState(prevState => ({ ...prevState, [field]: value }));
    };

    const fetchWeatherData = async () => {
        setIsLoadingWeather(true);
        try {
            const assessment = await getRouteWeatherData(shipmentDetails.pol, shipmentDetails.pod);
            setWeatherAssessment(assessment);
        } catch (error) {
            console.error('Weather data fetch failed:', error);
        } finally {
            setIsLoadingWeather(false);
        }
    };

    const getWeatherAdjustedFreight = () => {
        if (!weatherAssessment) return parseFloat(costs.freight.seaFreight.value) || 0;
        const baseFreight = parseFloat(costs.freight.seaFreight.value) || 0;
        return calculateWeatherAdjustment(baseFreight, weatherAssessment);
    };

    // --- Calculation Logic (using useMemo for performance) ---
    const totals = useMemo(() => {
        const zarRates = {
            usd: parseFloat(exchangeRates.usd) || 0,
            eur: parseFloat(exchangeRates.eur) || 0,
            gbp: parseFloat(exchangeRates.gbp) || 0,
            zar: 1,
            percent: 0, 
        };

        const calculateSectionTotal = (section: { [key: string]: CostItem }) => {
            return Object.values(section).reduce((acc, { value, currency }) => {
                const numericValue = parseFloat(value) || 0;
                const rate = zarRates[currency as keyof typeof zarRates] || 0;
                return acc + (numericValue * rate);
            }, 0);
        };
        
        const baseFreightTotal = calculateSectionTotal(costs.freight);
        const weatherAdjustment = weatherAssessment ? 
            (getWeatherAdjustedFreight() - parseFloat(costs.freight.seaFreight.value)) * zarRates.usd : 0;
        const subtotalFreight = baseFreightTotal + weatherAdjustment;
        const subtotalOrigin = calculateSectionTotal(costs.origin);
        const subtotalSaPort = calculateSectionTotal(costs.saPort);
        const subtotalClearing = calculateSectionTotal(costs.clearing);

        const transportBase = parseFloat(costs.transport.cartage.value) || 0;
        const fuelSurchargeRate = (parseFloat(costs.transport.fuelSurcharge.value) || 0) / 100;
        const fuelSurchargeAmount = transportBase * fuelSurchargeRate;
        const subtotalTransport = transportBase + fuelSurchargeAmount + (parseFloat(costs.transport.wharfage.value) || 0);

        const preVatTotal = subtotalFreight + subtotalOrigin + subtotalSaPort + subtotalClearing + subtotalTransport;
        const vatOnServices = (subtotalClearing + subtotalTransport) * VAT_RATE;
        const grandTotal = preVatTotal + vatOnServices;

        return {
            subtotalFreight, subtotalOrigin, subtotalSaPort, subtotalClearing,
            subtotalTransport, fuelSurchargeAmount, preVatTotal, vatOnServices, grandTotal,
            weatherAdjustment, baseFreightTotal
        };
    }, [costs, exchangeRates]);

    const landedCostTotals = useMemo(() => {
        const commercialValueZAR = (parseFloat(costs.landedCost.commercialInvoiceValue) || 0) * (parseFloat(exchangeRates.usd) || 0);
        const dutyRate = (parseFloat(costs.landedCost.dutyRate) || 0) / 100;
        const units = parseInt(costs.landedCost.units) || 1;
        const dutyBaseValue = commercialValueZAR * 1.1;
        const dutyAmount = dutyBaseValue * dutyRate;
        const vatBaseValue = dutyBaseValue + dutyAmount;
        const vatOnGoods = vatBaseValue * VAT_RATE;
        const totalClearingCosts = totals.subtotalSaPort + totals.subtotalClearing + totals.subtotalTransport + totals.vatOnServices;
        const totalLandedCost = commercialValueZAR + dutyAmount + vatOnGoods + totalClearingCosts;
        const costPerUnit = totalLandedCost / units;
        
        return {
            commercialValueZAR, dutyAmount, vatOnGoods, totalClearingCosts,
            totalLandedCost, costPerUnit,
        };
    }, [costs.landedCost, exchangeRates.usd, totals]);

    // --- UI Component Definitions ---
    const CostSection = ({ title, costData, sectionName, handleCostChange, currencyOptions }: CostSectionProps) => (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(costData).map(([key, item]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const isPercent = item.currency === 'percent';
                    return (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                            <div className="flex items-center">
                                <input type="number" step="0.01" value={item.value}
                                    onChange={(e) => handleCostChange(sectionName, key, { ...item, value: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                                    placeholder="0.00" />
                                {isPercent ? <span className="inline-flex items-center px-3 text-gray-600 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
                                : <select value={item.currency}
                                    onChange={(e) => handleCostChange(sectionName, key, { ...item, currency: e.target.value })}
                                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md focus:outline-none" >
                                    {currencyOptions.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                                </select>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }: InputFieldProps) => (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
        </div>
    );
    
    const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <select value={value} onChange={onChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">FCL Import Costing Model</h1>
                            <p className="text-sm text-gray-500">A tool for estimating landed costs for imports into South Africa</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setCurrentView('calculator')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    currentView === 'calculator' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Cost Calculator
                            </button>
                            <button
                                onClick={() => setCurrentView('avatar')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    currentView === 'avatar' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Supply Chain Expert
                            </button>
                            <button
                                onClick={() => setCurrentView('weather')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    currentView === 'weather' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                🌊 Weather Intelligence
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            {currentView === 'avatar' ? (
                <SupplyChainAvatar />
            ) : currentView === 'weather' ? (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Weather Intelligence Dashboard</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Origin Port</label>
                                        <p className="text-lg font-semibold text-gray-800">{shipmentDetails.pol}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Destination Port</label>
                                        <p className="text-lg font-semibold text-gray-800">{shipmentDetails.pod}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchWeatherData}
                                    disabled={isLoadingWeather}
                                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {isLoadingWeather ? 'Analyzing Route Weather...' : 'Get Weather Intelligence'}
                                </button>
                            </div>

                            {weatherAssessment && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Risk Assessment</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Risk Level:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                weatherAssessment.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                                weatherAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {weatherAssessment.riskLevel.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Estimated Delay:</span>
                                            <span className="font-semibold text-gray-800">{weatherAssessment.estimatedDelay.toFixed(1)} days</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Cost Impact:</span>
                                            <span className="font-semibold text-gray-800">{formatCurrency(weatherAssessment.costImpact)}</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                            <p className="text-sm text-blue-800">
                                                <span className="font-medium">Recommendation:</span> {weatherAssessment.recommendedAction}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {weatherAssessment && (
                                <>
                                    <div className="bg-white p-6 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm text-gray-600">Wind Speed</span>
                                                <p className="text-lg font-semibold text-gray-800">{weatherAssessment.currentConditions.windSpeed} knots</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Wave Height</span>
                                                <p className="text-lg font-semibold text-gray-800">{weatherAssessment.currentConditions.waveHeight}m</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Visibility</span>
                                                <p className="text-lg font-semibold text-gray-800">{weatherAssessment.currentConditions.visibility} km</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Storm Risk</span>
                                                <p className={`text-lg font-semibold ${
                                                    weatherAssessment.currentConditions.stormRisk === 'high' ? 'text-red-600' :
                                                    weatherAssessment.currentConditions.stormRisk === 'medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {weatherAssessment.currentConditions.stormRisk.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Impact Analysis</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Base Freight:</span>
                                                <span className="font-medium text-gray-800">{formatCurrency(totals.baseFreightTotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Weather Adjustment:</span>
                                                <span className={`font-medium ${totals.weatherAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {totals.weatherAdjustment > 0 ? '+' : ''}{formatCurrency(totals.weatherAdjustment)}
                                                </span>
                                            </div>
                                            <div className="border-t pt-3">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-gray-800">Weather-Adjusted Freight:</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(totals.subtotalFreight)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            ) : (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Shipment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Client Name" value={shipmentDetails.client} onChange={(e) => handleDetailChange(setShipmentDetails, 'client', e.target.value)} />
                                    <SelectField label="Port of Loading (POL)" value={shipmentDetails.pol} onChange={(e) => handleDetailChange(setShipmentDetails, 'pol', e.target.value)} options={PICK_LISTS.ports} />
                                    <SelectField label="Port of Discharge (POD)" value={shipmentDetails.pod} onChange={(e) => handleDetailChange(setShipmentDetails, 'pod', e.target.value)} options={PICK_LISTS.ports} />
                                    <SelectField label="Shipping Line" value={shipmentDetails.shippingLine} onChange={(e) => handleDetailChange(setShipmentDetails, 'shippingLine', e.target.value)} options={PICK_LISTS.shippingLines} />
                                    <SelectField label="Container Size" value={shipmentDetails.containerSize} onChange={(e) => handleDetailChange(setShipmentDetails, 'containerSize', e.target.value)} options={PICK_LISTS.containerSizes} />
                                    <InputField label="Commodity" value={shipmentDetails.commodity} onChange={(e) => handleDetailChange(setShipmentDetails, 'commodity', e.target.value)} />
                                    <SelectField label="Incoterm" value={shipmentDetails.incoterm} onChange={(e) => handleDetailChange(setShipmentDetails, 'incoterm', e.target.value)} options={PICK_LISTS.incoterms} />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                 <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Exchange Rates (to ZAR)</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField label="USD to ZAR" type="number" value={exchangeRates.usd} onChange={(e) => handleDetailChange(setExchangeRates, 'usd', e.target.value)} />
                                    <InputField label="EUR to ZAR" type="number" value={exchangeRates.eur} onChange={(e) => handleDetailChange(setExchangeRates, 'eur', e.target.value)} />
                                    <InputField label="GBP to ZAR" type="number" value={exchangeRates.gbp} onChange={(e) => handleDetailChange(setExchangeRates, 'gbp', e.target.value)} />
                                 </div>
                            </div>
                            <CostSection title="Freight Costs" costData={costs.freight} sectionName="freight" handleCostChange={handleCostStateChange} currencyOptions={['USD', 'EUR', 'GBP']} />
                            <CostSection title="Origin Charges" costData={costs.origin} sectionName="origin" handleCostChange={handleCostStateChange} currencyOptions={['USD', 'EUR', 'GBP']} />
                            <CostSection title="SA Port Charges" costData={costs.saPort} sectionName="saPort" handleCostChange={handleCostStateChange} currencyOptions={['ZAR']} />
                            <CostSection title="Forwarding & Clearing" costData={costs.clearing} sectionName="clearing" handleCostChange={handleCostStateChange} currencyOptions={['ZAR']} />
                            <CostSection title="Transport" costData={costs.transport} sectionName="transport" handleCostChange={handleCostStateChange} currencyOptions={['ZAR']} hasPercentage={true} />
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-8">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Costing Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Freight Costs:</span> 
                                        <span className="font-medium text-gray-800">{formatCurrency(totals.subtotalFreight)}</span>
                                    </div>
                                    {weatherAssessment && totals.weatherAdjustment !== 0 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 ml-2">Weather Adjustment:</span>
                                            <span className={`font-medium ${totals.weatherAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {totals.weatherAdjustment > 0 ? '+' : ''}{formatCurrency(totals.weatherAdjustment)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between"><span className="text-gray-600">Origin Charges:</span> <span className="font-medium text-gray-800">{formatCurrency(totals.subtotalOrigin)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">SA Port Charges:</span> <span className="font-medium text-gray-800">{formatCurrency(totals.subtotalSaPort)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Forwarding & Clearing:</span> <span className="font-medium text-gray-800">{formatCurrency(totals.subtotalClearing)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Transport:</span> <span className="font-medium text-gray-800">{formatCurrency(totals.subtotalTransport)}</span></div>
                                    <div className="border-t my-2"></div>
                                    <div className="flex justify-between text-base"><span className="font-semibold text-gray-700">Sub-Total (excl. VAT):</span> <span className="font-bold text-gray-900">{formatCurrency(totals.preVatTotal)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">VAT on Services (15%):</span> <span className="font-medium text-gray-800">{formatCurrency(totals.vatOnServices)}</span></div>
                                    <div className="border-t my-2 border-indigo-200"></div>
                                    <div className="flex justify-between text-xl p-2 bg-indigo-50 rounded-md"><span className="font-bold text-indigo-800">Grand Total:</span> <span className="font-extrabold text-indigo-900">{formatCurrency(totals.grandTotal)}</span></div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-96">
                                 <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Landed Cost Calculator</h3>
                                 <div className="grid grid-cols-1 gap-4 mb-4">
                                     <InputField label="Commercial Invoice Value (USD)" type="number" value={costs.landedCost.commercialInvoiceValue} onChange={(e) => handleLandedCostChange('commercialInvoiceValue', e.target.value)} />
                                     <InputField label="Rate of Duty (%)" type="number" value={costs.landedCost.dutyRate} onChange={(e) => handleLandedCostChange('dutyRate', e.target.value)} />
                                      <InputField label="Number of Units" type="number" value={costs.landedCost.units} onChange={(e) => handleLandedCostChange('units', e.target.value)} />
                                 </div>
                                 <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Commercial Value (ZAR):</span> <span className="font-medium text-gray-800">{formatCurrency(landedCostTotals.commercialValueZAR)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Customs Duty:</span> <span className="font-medium text-gray-800">{formatCurrency(landedCostTotals.dutyAmount)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">VAT on Goods:</span> <span className="font-medium text-gray-800">{formatCurrency(landedCostTotals.vatOnGoods)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Total Clearing Costs:</span> <span className="font-medium text-gray-800">{formatCurrency(landedCostTotals.totalClearingCosts)}</span></div>
                                    <div className="border-t my-2"></div>
                                    <div className="flex justify-between text-base"><span className="font-semibold text-gray-700">Total Landed Cost:</span> <span className="font-bold text-gray-900">{formatCurrency(landedCostTotals.totalLandedCost)}</span></div>
                                    <div className="border-t my-2 border-green-200"></div>
                                    <div className="flex justify-between text-xl p-2 bg-green-50 rounded-md"><span className="font-bold text-green-800">Cost per Unit:</span> <span className="font-extrabold text-green-900">{formatCurrency(landedCostTotals.costPerUnit)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
