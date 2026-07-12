// @ts-nocheck
import { BaseProvider, ProviderResponse } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class MeeshoProvider implements BaseProvider {
  name = "Meesho";

  async search(query: string): Promise<ProviderResponse> {
    const products = await fetchYahooProducts("meesho.com", "Meesho", query);
    return { products };
  }
}
