import { Purchase } from '../types';

export const mockPurchases: Purchase[] = [
  {
    id: '1',
    date: '2025-08-27T14:30:00Z',
    storeName: 'Carrefour',
    total: 15.67,
    items: [
      { name: 'Milk 1L', price: 1.20, quantity: 1 },
      { name: 'Bread', price: 0.80, quantity: 2 },
      { name: 'Apples 1kg', price: 2.50, quantity: 1 },
      { name: 'Chicken breast', price: 8.97, quantity: 1 }
    ]
  },
  {
    id: '2',
    date: '2025-08-26T10:15:00Z',
    storeName: 'Lidl',
    total: 7.32,
    items: [
      { name: 'Coffee', price: 3.99, quantity: 1 },
      { name: 'Bananas', price: 1.33, quantity: 1 },
      { name: 'Yogurt', price: 2.00, quantity: 1 }
    ]
  },
  {
    id: '3',
    date: '2025-08-25T16:45:00Z',
    storeName: 'Auchan',
    total: 23.45,
    items: [
      { name: 'Pasta 500g', price: 1.25, quantity: 2 },
      { name: 'Tomato sauce', price: 1.80, quantity: 1 },
      { name: 'Cheese 200g', price: 4.50, quantity: 1 },
      { name: 'Ground beef 500g', price: 6.90, quantity: 1 },
      { name: 'Onions 1kg', price: 1.20, quantity: 1 },
      { name: 'Olive oil', price: 5.50, quantity: 1 }
    ]
  }
];

// Simulate API delay
export const fetchPurchases = (): Promise<Purchase[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockPurchases]);
    }, 800);
  });
};

// Simulate adding a new purchase
export const addPurchase = (purchase: Omit<Purchase, 'id'>): Promise<Purchase> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPurchase: Purchase = {
        ...purchase,
        id: Date.now().toString()
      };
      mockPurchases.unshift(newPurchase);
      resolve(newPurchase);
    }, 1000);
  });
};
