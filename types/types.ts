export interface Tenant {
  id: string;
  name: string;
  photo?: string;
  monthlyRent: number;
  createdAt: string;
}

export interface AddOn {
  id: string;
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  date: string;
  rent: number;
  electricityReading?: number;
  electricityPerUnit?: number;
  electricityBill?: number;
  gasReading?: number;
  gasPerUnit?: number;
  gasBill?: number;
  addOns: AddOn[];
  discount?: number;
  discountDescription?: string;
  pending?: number;
  pendingDescription?: string;
  total: number;
  receivedAmount?: number;
  createdAt: string;
}

