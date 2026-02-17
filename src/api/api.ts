interface FormData {
  searchBy: "phone" | "email";
  searchValue: string;
}

interface ApiResponse {
  phones?: Array<{ phone: string; ids: string[] }>;
  emails?: Array<{ email: string; ids: string[] }>;
}

interface RawApiResponse {
  success: boolean;
  count: number;
  data: Array<{
    row_duplicate_id_remark?: string;
    row_duplicate_position?: string;
    [key: string]: any;
  }>;
  execution_time_ms?: number;
  from_cache?: boolean;
}

const api = {
  baseUrl: "http://65.2.187.159:8000",
  endpoints: {
    posts: "/query",
  },
};

// Parse row_duplicate_id_remark: "+919422581444 (in Id(s): 00Qfu00000NVL2yEAH, 00Q2w00000dgMu8EAE)"
// Handles multiple entries separated by |: "+919789255705 (in Id(s): 00Qfu00000MxasPEAR, 00Qfu00000MxapBEAR) | +919080324653 (in Id(s): 00Qfu00000MxasPEAR, 00Qfu00000MxapBEAR)"
const parsePhoneData = (remark: string): Array<{ phone: string; ids: string[] }> => {
  const entries = remark.split('|').map(entry => entry.trim()).filter(entry => entry);
  const results: Array<{ phone: string; ids: string[] }> = [];
  
  for (const entry of entries) {
    const match = entry.match(/^(.+?)\s*\(in Id\(s\):\s*(.+?)\)$/);
    if (match) {
      const phone = match[1].trim();
      const ids = match[2].split(',').map(id => id.trim()).filter(id => id);
      results.push({ phone, ids });
    }
  }
  
  return results;
};

// Parse row_duplicate_position: "es_pramod@yahoo.com [00Q2w00000dgMu8EAE, 00Qfu00000NVL2yEAH]"
// Handles multiple entries separated by |: "sriram20199@gmail.com [00Qfu00000MxapBEAR, 00Qfu00000MxasPEAR] | sriram677@gmail.com [00Qfu00000MxapBEAR, 00Qfu00000MxasPEAR]"
const parseEmailData = (position: string): Array<{ email: string; ids: string[] }> => {
  const entries = position.split('|').map(entry => entry.trim()).filter(entry => entry);
  const results: Array<{ email: string; ids: string[] }> = [];
  
  for (const entry of entries) {
    const match = entry.match(/^(.+?)\s*\[(.+?)\]$/);
    if (match) {
      const email = match[1].trim();
      const ids = match[2].split(',').map(id => id.trim()).filter(id => id);
      results.push({ email, ids });
    }
  }
  
  return results;
};

export const submitQuery = async (formData: FormData): Promise<{
  ok: boolean;
  status: number;
  data: ApiResponse;
  rawData?: any[];
}> => {
  try {
    // Transform the request body to match API expectations
    // API expects: {"Email": "string", "Id": "string", "Phone": "string"}
    const requestBody = {
      Email: formData.searchBy === "email" ? formData.searchValue : "",
      Id: "",
      Phone: formData.searchBy === "phone" ? formData.searchValue : ""
    };
    
    const response = await fetch(`${api.baseUrl}${api.endpoints.posts}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: {}
      };
    }

    const rawData: RawApiResponse = await response.json();
    
    if (!rawData.success || !rawData.data || rawData.data.length === 0) {
      return {
        ok: true,
        status: response.status,
        data: {},
        rawData: []
      };
    }

    // Parse the API response - use first record for display
    const firstRecord = rawData.data[0];
    const parsedData: ApiResponse = {};
    
    // Parse phone data from row_duplicate_id_remark
    if (firstRecord.row_duplicate_id_remark) {
      const phoneData = parsePhoneData(firstRecord.row_duplicate_id_remark);
      if (phoneData.length > 0) {
        parsedData.phones = phoneData;
      }
    }
    
    // Parse email data from row_duplicate_position
    if (firstRecord.row_duplicate_position) {
      const emailData = parseEmailData(firstRecord.row_duplicate_position);
      if (emailData.length > 0) {
        parsedData.emails = emailData;
      }
    }
    
    return {
      ok: true,
      status: response.status,
      data: parsedData,
      rawData: rawData.data
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      ok: false,
      status: 500,
      data: {}
    };
  }
};

export default api;
