
export interface Order {
  date: string; // ISO string format
  orderFy: string;
  partyName: string;
  amount: number;
  reserve: number;
  total: number;
  orderNo: string;
  segment: string;
  reqReserve12: number;
}

export interface GPData {
  country: string;
  segment: string;
  bonhorfferCode: string;
  exportValue: number;
  importValue: number;
  gp: number;
}

export interface OrderData {
  date: string;
  fy: string;
  salesPerson: string;
  segment: string;
  country: string;
  orderNo: string;
  amount: number;
}

export interface OrderProduct {
  orderNo: string;
  productCode: string;
  productName: string;
  quantity: number;
}

export interface CombinedOrderData extends OrderData {
    products: OrderProduct[];
    productCount: number;
}