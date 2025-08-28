export interface Purchase {
  id: string;
  date: string;
  storeName: string;
  total: number;
  items: PurchaseItem[];
  imageUrl?: string;
}

export interface PurchaseItem {
  name: string;
  price: number;
  quantity: number;
}

export type RootTabParamList = {
  Home: undefined;
  Scan: undefined;
  Profile: undefined;
};
