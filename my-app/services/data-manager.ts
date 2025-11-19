import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from './notification-storage';
import {
  addProduct as addProductToDB,
  Product as DBProduct,
  deleteProduct as deleteProductFromDB,
  fetchPremiumItems,
  fetchProducts,
  updateProduct as updateProductInDB,
  uploadProductsBulk,
  watchProductChanges
} from './supabase-database';

const PRODUCTS_KEY = '@all_products';
const PREMIUM_KEY = '@all_premium_items';

export type Product = {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price: string;
  priceValue: number;
  image: string;
};

export type DataAction = {
  type: 'add' | 'update' | 'delete';
  category: 'products' | 'premium';
  item?: Product;
  itemId?: string;
};

// Helper function to convert DB product to App product
function convertDBToAppProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.id,
    sku: dbProduct.sku,
    title: dbProduct.title,
    description: dbProduct.description,
    price: `৳ ${dbProduct.price}`, // Add currency symbol for display
    priceValue: dbProduct.price_value, // Map price_value to priceValue
    image: dbProduct.image,
  };
}

// Helper function to convert App product to DB product
function convertAppToDBProduct(appProduct: Product, isPremium: boolean): Omit<DBProduct, 'created_at' | 'updated_at'> {
  // Extract numeric value from price string (e.g., "৳ 150" -> 150)
  const priceNumeric = typeof appProduct.priceValue === 'number' 
    ? appProduct.priceValue 
    : parseFloat(appProduct.price.replace(/[^0-9.-]+/g, '')) || 0;

  // Sanitize strings - remove null characters and trim
  const sanitizeString = (str: string | undefined) => {
    if (!str) return undefined;
    const cleaned = str.replace(/\0/g, '').trim();
    return cleaned || undefined;
  };

  return {
    id: appProduct.id,
    sku: appProduct.sku,
    title: sanitizeString(appProduct.title) || 'Untitled',
    description: sanitizeString(appProduct.description),
    price: priceNumeric, // Database expects number
    price_value: priceNumeric, // Map priceValue to price_value (database column name)
    image: appProduct.image,
    is_premium: isPremium,
  };
}

class DataManager {
  private actionCallback?: (action: DataAction) => void;
  private useDatabase: boolean = true; // Use database instead of files
  private watchCleanupFunction?: () => void;

  // Initialize database connection and real-time watching
  async initialize() {
    try {
      if (this.useDatabase) {
        console.log('🚀 Initializing data from Supabase Database...');
        
        // Set up real-time watching for all product changes
        this.watchCleanupFunction = watchProductChanges(async (updatedProducts) => {
          console.log('🔄 Real-time update received from database');
          // Cache the updated data in AsyncStorage for offline access
          const regularProducts = updatedProducts.filter(p => !p.is_premium);
          const premiumProducts = updatedProducts.filter(p => p.is_premium);
          
          await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(regularProducts));
          await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premiumProducts));
          
          // Trigger callback to notify all listeners (Shop, Premium, Manager tabs)
          this.logAction({
            type: 'update',
            category: 'products',
          });
        });
        
        // Initial data fetch and cache
        await this.refreshDataFromDatabase();
        
        console.log('✅ Database initialization completed');
      } else {
        console.log('📱 Using local storage only');
      }
    } catch (error) {
      console.error('❌ Failed to initialize data manager:', error);
      // Fall back to cached data if available
      console.log('⚠️ Falling back to cached data...');
    }
  }

  // Refresh data from database and update cache
  private async refreshDataFromDatabase() {
    try {
      const [dbProducts, dbPremiumItems] = await Promise.all([
        fetchProducts(),
        fetchPremiumItems()
      ]);
      
      // Convert DB products to app format
      const products = dbProducts.map(convertDBToAppProduct);
      const premiumItems = dbPremiumItems.map(convertDBToAppProduct);
      
      // Cache in AsyncStorage
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premiumItems));
      
      console.log(`📊 Cached ${products.length} products and ${premiumItems.length} premium items`);
    } catch (error) {
      console.error('❌ Failed to refresh data from database:', error);
      throw error;
    }
  }

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      if (this.useDatabase) {
        console.log('📥 Fetching products from database...');
        const dbProducts = await fetchProducts();
        const products = dbProducts.map(convertDBToAppProduct);
        
        // Update cache
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        return products;
      } else {
        // Fallback to cached data
        const cached = await AsyncStorage.getItem(PRODUCTS_KEY);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // Fallback to cache
      const cached = await AsyncStorage.getItem(PRODUCTS_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Get all premium items
  async getPremiumItems(): Promise<Product[]> {
    try {
      if (this.useDatabase) {
        console.log('📥 Fetching premium items from database...');
        const dbPremiumItems = await fetchPremiumItems();
        const premiumItems = dbPremiumItems.map(convertDBToAppProduct);
        
        // Update cache
        await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premiumItems));
        return premiumItems;
      } else {
        // Fallback to cached data
        const cached = await AsyncStorage.getItem(PREMIUM_KEY);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (error) {
      console.error('❌ Error fetching premium items:', error);
      
      // Fallback to cache
      const cached = await AsyncStorage.getItem(PREMIUM_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Add new item
  async addItem(item: Product, isPremium: boolean): Promise<boolean> {
    try {
      console.log(`➕ Adding item to database: ${item.title} (${isPremium ? 'premium' : 'regular'})`);
      
      if (this.useDatabase) {
        // Get device ID to exclude from notifications
        const { deviceId } = await getDeviceId();
        
        const dbProduct = convertAppToDBProduct(item, isPremium);
        await addProductToDB(dbProduct, deviceId);
        console.log('✅ Item added to database successfully');
        
        // Refresh local cache
        await this.refreshDataFromDatabase();
        
        // Notification will be created automatically by database trigger
        
        this.logAction({
          type: 'add',
          category: isPremium ? 'premium' : 'products',
          item,
        });
        
        return true;
      } else {
        console.log('⚠️ Database disabled, operation skipped');
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding item:', error);
      return false;
    }
  }

  // Update existing item
  async updateItem(item: Product, isPremium: boolean): Promise<boolean> {
    try {
      console.log(`📝 Updating item in database: ${item.title}`);
      
      if (this.useDatabase) {
        const updates = convertAppToDBProduct(item, isPremium);
        await updateProductInDB(item.id, updates);
        console.log('✅ Item updated in database successfully');
        
        // Refresh local cache
        await this.refreshDataFromDatabase();
        
        this.logAction({
          type: 'update',
          category: isPremium ? 'premium' : 'products',
          item,
        });
        
        return true;
      } else {
        console.log('⚠️ Database disabled, operation skipped');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating item:', error);
      return false;
    }
  }

  // Delete item
  async deleteItem(itemId: string, isPremium: boolean): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting item from database: ${itemId}`);
      
      if (this.useDatabase) {
        // Get device ID to exclude from notifications
        const { deviceId } = await getDeviceId();
        
        // Pass device ID so trigger can exclude creator from notifications
        await deleteProductFromDB(itemId, deviceId);
        console.log('✅ Item deleted from database successfully');
        
        // Refresh local cache
        await this.refreshDataFromDatabase();
        
        // Notification will be created automatically by database trigger
        
        this.logAction({
          type: 'delete',
          category: isPremium ? 'premium' : 'products',
          itemId,
        });
        
        return true;
      } else {
        console.log('⚠️ Database disabled, operation skipped');
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      return false;
    }
  }

  // Migrate existing JSON data to database (one-time operation)
  async migrateJSONToDatabase(): Promise<boolean> {
    try {
      console.log('🔄 Starting migration from JSON files to database...');
      
      // Read current JSON data
      const productsJson = await AsyncStorage.getItem(PRODUCTS_KEY);
      const premiumJson = await AsyncStorage.getItem(PREMIUM_KEY);
      
      if (!productsJson && !premiumJson) {
        console.log('ℹ️ No JSON data found to migrate');
        return true;
      }
      
      const allProducts: DBProduct[] = [];
      
      // Process regular products
      if (productsJson) {
        const products: Product[] = JSON.parse(productsJson);
        const dbProducts = products.map(p => convertAppToDBProduct(p, false));
        allProducts.push(...dbProducts);
      }
      
      // Process premium items
      if (premiumJson) {
        const premiumItems: Product[] = JSON.parse(premiumJson);
        const dbPremiumItems = premiumItems.map(p => convertAppToDBProduct(p, true));
        allProducts.push(...dbPremiumItems);
      }
      
      // Bulk upload to database
      if (allProducts.length > 0) {
        await uploadProductsBulk(allProducts);
        console.log(`✅ Migration completed: ${allProducts.length} items uploaded to database`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  }

  // Clear all cached data and force refresh from database
  async clearAllLocalData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all local data...');
      
      // Clear AsyncStorage cache
      await AsyncStorage.multiRemove([PRODUCTS_KEY, PREMIUM_KEY]);
      
      if (this.useDatabase) {
        // Refresh from database
        await this.refreshDataFromDatabase();
        console.log('✅ Local data cleared and refreshed from database');
      } else {
        console.log('✅ Local data cleared');
      }
    } catch (error) {
      console.error('❌ Error clearing local data:', error);
    }
  }

  // Force refresh data from database
  async forceRefreshFromDatabase(): Promise<void> {
    if (this.useDatabase) {
      console.log('🔄 Force refreshing data from database...');
      await this.refreshDataFromDatabase();
      console.log('✅ Data refreshed from database');
    } else {
      console.log('⚠️ Database disabled, cannot refresh');
    }
  }

  // Cleanup resources
  cleanup(): void {
    if (this.watchCleanupFunction) {
      this.watchCleanupFunction();
      this.watchCleanupFunction = undefined;
      console.log('🧹 Data manager cleanup completed');
    }
  }

  // Log actions for external handlers
  private logAction(action: DataAction) {
    console.log('📋 Action logged:', action);
    if (this.actionCallback) {
      this.actionCallback(action);
    }
  }

  // Set action callback for external handlers
  // Returns cleanup function to remove the callback
  onAction(callback: (action: DataAction) => void): () => void {
    this.actionCallback = callback;
    // Return cleanup function
    return () => {
      this.actionCallback = undefined;
    };
  }

  // Enable/disable database usage
  setDatabaseMode(enabled: boolean) {
    this.useDatabase = enabled;
    console.log(`🔧 Database mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Export data to JSON format (for compatibility)
  async exportToJSON(): Promise<{ products: Product[]; premiumItems: Product[] }> {
    try {
      const [products, premiumItems] = await Promise.all([
        this.getProducts(),
        this.getPremiumItems()
      ]);
      
      return { products, premiumItems };
    } catch (error) {
      console.error('❌ Error exporting to JSON:', error);
      return { products: [], premiumItems: [] };
    }
  }

  // Get file paths (for compatibility - returns database info instead)
  getFilePaths(): string[] {
    return [
      'Database: products table (regular products)',
      'Database: products table (premium items)',
      'Cache: AsyncStorage @all_products',
      'Cache: AsyncStorage @all_premium_items'
    ];
  }

  // Reset to defaults (clear database and reload sample data)
  async resetToDefaults(): Promise<boolean> {
    try {
      console.log('🔄 Resetting to default data...');
      
      // This would require recreating the sample data
      // For now, just clear local cache and refresh from database
      await this.clearAllLocalData();
      
      console.log('✅ Reset completed');
      return true;
    } catch (error) {
      console.error('❌ Error resetting to defaults:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataManager = new DataManager();
export default dataManager;