interface FormData {
  searchBy: "phone" | "email";
  searchValue: string;
}

interface ApiResponse {
  phone?: string;
  phoneDuplicates?: string[];
  email?: string;
  emailDuplicates?: string[];
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
const parsePhoneData = (remark: string): { phone: string; ids: string[] } | null => {
  const match = remark.match(/^(.+?)\s*\(in Id\(s\):\s*(.+?)\)$/);
  if (!match) return null;
  
  const phone = match[1].trim();
  const ids = match[2].split(',').map(id => id.trim()).filter(id => id);
  
  return { phone, ids };
};

// Parse row_duplicate_position: "es_pramod@yahoo.com [00Q2w00000dgMu8EAE, 00Qfu00000NVL2yEAH]"
const parseEmailData = (position: string): { email: string; ids: string[] } | null => {
  const match = position.match(/^(.+?)\s*\[(.+?)\]$/);
  if (!match) return null;
  
  const email = match[1].trim();
  const ids = match[2].split(',').map(id => id.trim()).filter(id => id);
  
  return { email, ids };
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
      if (phoneData) {
        parsedData.phone = phoneData.phone;
        parsedData.phoneDuplicates = phoneData.ids;
      }
    }
    
    // Parse email data from row_duplicate_position
    if (firstRecord.row_duplicate_position) {
      const emailData = parseEmailData(firstRecord.row_duplicate_position);
      if (emailData) {
        parsedData.email = emailData.email;
        parsedData.emailDuplicates = emailData.ids;
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
