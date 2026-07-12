// @ts-nocheck
import { BaseProvider, ProviderResponse } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class RelianceProvider implements BaseProvider {
  name = "Reliance Digital";

  async search(query: string): Promise<ProviderResponse> {
    const products = await fetchYahooProducts("reliancedigital.in", "Reliance Digital", query);
    return { products };
  }
}
