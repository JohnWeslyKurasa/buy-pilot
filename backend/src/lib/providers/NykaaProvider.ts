// @ts-nocheck
import { BaseProvider, ProviderResponse } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class NykaaProvider implements BaseProvider {
  name = "Nykaa";

  async search(query: string): Promise<ProviderResponse> {
    const products = await fetchYahooProducts("nykaa.com", "Nykaa", query);
    return { products };
  }
}
