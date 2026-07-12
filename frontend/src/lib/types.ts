export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating?: string;
  reviewCount?: number;
  marketplace: string;
  productUrl: string;
  availability: boolean;
  deliveryDate?: string;
  freeDelivery?: boolean;
  emiAvailable?: boolean;
  codAvailable?: boolean;
  stockStatus?: string;
  seller?: string;
  batteryLife?: string;
  anc?: boolean;
  bluetoothVersion?: string;
  waterResistance?: string;
  chargingTime?: string;
  warranty?: string;
  driverSize?: string;
  weight?: string;
  features?: string[];
}

export interface GroupedProduct {
  id: string;
  title: string;
  brand: string;
  image: string;
  rating?: string;
  reviewCount?: number;
  batteryLife?: string;
  anc?: boolean;
  bluetoothVersion?: string;
  waterResistance?: string;
  chargingTime?: string;
  warranty?: string;
  driverSize?: string;
  weight?: string;
  offers: {
    marketplace: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    productUrl: string;
    deliveryDate?: string;
    freeDelivery?: boolean;
    stockStatus?: string;
  }[];
  lowestPrice: number;
  highestPrice: number;
  badges: string[];
}

export interface ProviderResponse {
  products: Product[];
  error?: string;
}

export interface BaseProvider {
  name: string;
  search: (query: string, browser?: any) => Promise<ProviderResponse>;
}

export interface CategoryRecommendation {
  title: string;
  iconType: string;
  product: GroupedProduct;
  colorClass: string;
}

export interface AiAnalysis {
  summary: string;
  recommendations: CategoryRecommendation[];
  pros: string[];
  cons: string[];
}
