import { privateApi } from "@/api/api";

export interface EarningsSummary {
  total_sales: number;
  total_commission: number;
  net_earnings: number;
  transaction_count: number;
  commission_rate: number;
  period: string;
}

export interface Transaction {
  id: number;
  date: string;
  event_name: string;
  event_id: number | null;
  customer_name: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  payment_method: string;
  status: string;
}

export interface EarningsResponse {
  summary: EarningsSummary;
  transactions: Transaction[];
}

export interface MonthlyEarning {
  period: string;
  total_sales: number;
  total_commission: number;
  net_earnings: number;
}

export interface TopEvent {
  event_id: number;
  event_name: string;
  transaction_count: number;
  total_revenue: number;
  total_commission: number;
  net_revenue: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  total: number;
}

export interface StatisticsResponse {
  monthly_earnings: MonthlyEarning[];
  top_events: TopEvent[];
  payment_methods: PaymentMethod[];
}

export const vendorService = {
  /**
   * Obtenir le résumé des revenus
   * @param period - 'all' | 'today' | 'week' | 'month'
   */
  getEarnings: async (period: string = 'month'): Promise<EarningsResponse> => {
    try {
      const response = await privateApi.get(`/vendor/earnings`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching earnings:", error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques détaillées
   */
  getStatistics: async (): Promise<StatisticsResponse> => {
    try {
      const response = await privateApi.get('/vendor/earnings/statistics');
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  },

  /**
   * Exporter les transactions en CSV
   */
  exportCSV: async (): Promise<Blob> => {
    try {
      const response = await privateApi.get('/vendor/earnings/export', {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenus_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  }
};