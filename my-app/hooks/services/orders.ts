import { supabase } from '@/config/supabase';

export type OrderItem = {
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
};

export type Order = {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  customer_id: string;
  customer_name: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
};

/**
 * Create orders in database
 * This will trigger notifications to product creators
 */
export async function createOrders(
  items: OrderItem[],
  customerId: string,
  customerName: string
): Promise<{ success: boolean; error?: string; orderIds?: string[] }> {
  try {
    console.log('📦 Creating orders for', items.length, 'items');
    
    const orderIds: string[] = [];
    
    // Create an order for each cart item
    for (const item of items) {
      // Validate price is a valid number
      if (!item.product_price || isNaN(item.product_price) || item.product_price <= 0) {
        console.error('❌ Invalid price for item:', item);
        throw new Error(`Invalid price for product: ${item.product_title}`);
      }
      
      const orderData = {
        product_id: item.product_id,
        product_title: item.product_title,
        product_price: item.product_price,
        customer_id: customerId,
        customer_name: customerName,
        quantity: item.quantity,
        total_amount: item.product_price * item.quantity,
        status: 'pending' as const,
      };
      
      console.log('📝 Inserting order:', orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      
      if (error) {
        console.error('❌ Error creating order:', error);
        throw error;
      }
      
      if (data) {
        orderIds.push(data.id);
        console.log('✅ Order created:', data.id);
      }
    }
    
    console.log('✅ All orders created successfully:', orderIds);
    return { success: true, orderIds };
  } catch (error: any) {
    console.error('❌ Error in createOrders:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get orders for a specific customer
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error in getCustomerOrders:', error);
    return [];
  }
}

/**
 * Get orders for products created by a specific user (for managers)
 */
export async function getManagerOrders(managerId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products!inner(created_by)
      `)
      .eq('products.created_by', managerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching manager orders:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error in getManagerOrders:', error);
    return [];
  }
}
