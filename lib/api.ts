
const API_CONFIG = {
  endpoint: "https://www.goldapi.io/api/XAU/USD",
  apiKey: "goldapi-60yvsmab5at1h-io",
}

const CURRENCY_API = {
  endpoint: "https://api.exchangerate-api.com/v4/latest/USD",
}

export interface GoldPriceData {
  timestamp: number
  price: number
  currency: string
  exchange: string
  metal: string
  prev_close_price?: number
  ch?: number
  chp?: number
}

export interface ExchangeRateData {
  base: string
  date: string
  rates: {
    [key: string]: number
  }
}

export interface GoldRatesByKarat {
  "18K": { buyPrice: number; sellPrice: number }
  "21K": { buyPrice: number; sellPrice: number }
  "24K": { buyPrice: number; sellPrice: number }
}

/**
 * Fetches the latest gold prices from goldapi.io
 */
export async function fetchGoldPrices(currency = "USD"): Promise<GoldPriceData> {
  try {
    // Use the real goldapi.io endpoint
    const response = await fetch(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: {
        "x-access-token": API_CONFIG.apiKey,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching gold prices:", error)
    throw error
  }
}

/**
 * Fetches the latest currency exchange rates
 */
export async function fetchExchangeRates(): Promise<ExchangeRateData> {
  try {
    const response = await fetch(CURRENCY_API.endpoint)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    throw error
  }
}

/**
 * Converts gold price per troy ounce to prices by karat
 * @param goldPricePerOz Gold price per troy ounce in USD
 * @returns Object with prices for different karats
 */
export function convertToKaratPrices(goldPricePerOz: number): GoldRatesByKarat {
  // Gold purity factors
  const purityFactors = {
    "18K": 0.75, // 18K gold is 75% pure
    "21K": 0.875, // 21K gold is 87.5% pure
    "24K": 0.9999, // 24K gold is 99.99% pure (essentially pure gold)
  }

  // Convert from troy ounce to gram (1 troy oz = 31.1034768 grams)
  const goldPricePerGram = goldPricePerOz / 31.1034768

  // Calculate buy and sell prices with a small spread
  // Typically, sell prices are lower than buy prices
  const spread = 0.05 // 5% spread between buy and sell

  return {
    "18K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["18K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["18K"] * (1 - spread)).toFixed(2)),
    },
    "21K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["21K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["21K"] * (1 - spread)).toFixed(2)),
    },
    "24K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["24K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["24K"] * (1 - spread)).toFixed(2)),
    },
  }
}
