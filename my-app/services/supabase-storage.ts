import { supabase } from '../config/supabase';

/**
 * Supabase Storage Service
 * Handles fetching JSON data from Supabase Cloud Storage with real-time updates
 */

// Cache to track last modified times for change detection
const fileCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Fetch JSON data from Supabase Storage
 * @param filePath - Path to the file in Supabase Storage (e.g., 'data/products.json')
 * @param useCache - Whether to use cached data if available
 * @returns Parsed JSON data
 */
export async function fetchJSONFromStorage<T>(
  filePath: string,
  useCache: boolean = false
): Promise<T> {
  try {
    // Check cache first if requested
    if (useCache && fileCache.has(filePath)) {
      const cached = fileCache.get(filePath);
      const age = Date.now() - cached!.timestamp;
      // Use cache if less than 30 seconds old
      if (age < 30000) {
        console.log(`📦 Using cached data for ${filePath}`);
        return cached!.data as T;
      }
    }

    // Get the public URL for the file in the 'json-data' bucket
    const { data: urlData } = supabase.storage
      .from('json-data')
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      throw new Error(`Failed to get public URL for ${filePath}`);
    }

    console.log(`🌐 Fetching fresh data from Supabase: ${filePath}`);
    
    // Fetch the file content with cache busting
    const response = await fetch(`${urlData.publicUrl}?t=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
    }
    
    // Parse JSON
    const data = await response.json();
    
    // Update cache
    fileCache.set(filePath, {
      data,
      timestamp: Date.now()
    });
    
    return data as T;
  } catch (error) {
    console.error(`❌ Error fetching ${filePath} from Supabase Storage:`, error);
    
    // Try to return cached data as fallback
    if (fileCache.has(filePath)) {
      console.log(`⚠️ Using stale cache for ${filePath} due to error`);
      return fileCache.get(filePath)!.data as T;
    }
    
    throw error;
  }
}

/**
 * Fetch products data from Supabase Storage
 */
export async function fetchProducts() {
  return fetchJSONFromStorage('data/products.json');
}

/**
 * Fetch premium items data from Supabase Storage
 */
export async function fetchPremiumItems() {
  return fetchJSONFromStorage('data/premium-items.json');
}

/**
 * Setup real-time polling for data changes
 * @param filePath - File to monitor
 * @param callback - Function to call when data changes
 * @param intervalMs - Polling interval in milliseconds (default: 30 seconds)
 * @returns Cleanup function to stop polling
 */
export function watchFileChanges<T>(
  filePath: string,
  callback: (data: T) => void,
  intervalMs: number = 30000
): () => void {
  let previousData: string | null = null;
  
  const checkForChanges = async () => {
    try {
      const data = await fetchJSONFromStorage<T>(filePath, false);
      const dataStr = JSON.stringify(data);
      
      if (previousData === null) {
        // First load
        previousData = dataStr;
        callback(data);
        console.log(`👀 Watching ${filePath} for changes...`);
      } else if (dataStr !== previousData) {
        // Data changed!
        previousData = dataStr;
        console.log(`🔄 Detected changes in ${filePath}, updating...`);
        callback(data);
      }
    } catch (error) {
      console.error(`Error checking ${filePath} for changes:`, error);
    }
  };
  
  // Check immediately
  checkForChanges();
  
  // Then poll at intervals
  const intervalId = setInterval(checkForChanges, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log(`🛑 Stopped watching ${filePath}`);
  };
}

/**
 * Clear all cached data
 */
export function clearCache() {
  fileCache.clear();
  console.log('🗑️ Cleared Supabase storage cache');
}

/**
 * Upload JSON data to Supabase Storage
 * @param filePath - Path to the file in Supabase Storage (e.g., 'data/products.json')
 * @param data - JSON data to upload
 * @returns Upload result
 */
export async function uploadJSONToStorage<T>(filePath: string, data: T): Promise<void> {
  try {
    console.log(`📤 Uploading data to Supabase: ${filePath}`);
    
    // Convert data to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Convert to base64 for React Native compatibility
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
    
    // Decode base64 to binary string then to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use upload with upsert to handle both create and update
    console.log(`🔄 Uploading with upsert (create or update): ${filePath}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('json-data')
      .upload(filePath, bytes, {
        contentType: 'application/json',
        cacheControl: '0',
        upsert: true // This will create if not exists, or update if exists
      });
    
    if (uploadError) {
      console.error('❌ Upload error details:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    console.log(`✅ File uploaded/updated successfully via upsert`);
    
    // Clear cache for this file
    fileCache.delete(filePath);
    
    console.log(`✅ Successfully uploaded ${filePath} to Supabase`);
  } catch (error) {
    console.error(`❌ Error uploading ${filePath} to Supabase:`, error);
    throw error;
  }
}

/**
 * Upload products data to Supabase Storage
 */
export async function uploadProducts(products: any[]) {
  console.log('🚀 DEBUG: uploadProducts() called with', products.length, 'products');
  console.log('🔄 DEBUG: Calling uploadJSONToStorage for data/products.json');
  return uploadJSONToStorage('data/products.json', products);
}

/**
 * Upload premium items data to Supabase Storage
 */
export async function uploadPremiumItems(premiumItems: any[]) {
  console.log('🚀 DEBUG: uploadPremiumItems() called with', premiumItems.length, 'items');
  console.log('🔄 DEBUG: Calling uploadJSONToStorage for data/premium-items.json');
  return uploadJSONToStorage('data/premium-items.json', premiumItems);
}
