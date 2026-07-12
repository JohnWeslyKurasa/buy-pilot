// @ts-nocheck
import { BaseProvider, ProviderResponse } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class CromaProvider implements BaseProvider {
  name = "Croma";

  async search(query: string): Promise<ProviderResponse> {
    const products = await fetchYahooProducts("croma.com", "Croma", query);
    return { products };
  }
}
