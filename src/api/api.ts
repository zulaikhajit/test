interface FormData {
  searchBy: "phone" | "email" | "id";
  searchValue: string;
}

export interface TableRow {
  Name: string;
  Email: string;
  Phone: string;
  Id: string;
}

interface RawApiResponse {
  success: boolean;
  count: number;
  data: Array<{
    Name?: string;
    Email?: string;
    Phone?: string;
    Id?: string;
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

export const submitQuery = async (formData: FormData): Promise<{
  ok: boolean;
  status: number;
  tableData?: TableRow[];
}> => {
  try {
    // Transform the request body to match API expectations
    // API expects: {"Email": "string", "Id": "string", "Phone": "string"}
    const requestBody = {
      Email: formData.searchBy === "email" ? formData.searchValue : "",
      Id: formData.searchBy === "id" ? formData.searchValue : "",
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
        status: response.status
      };
    }

    const rawData: RawApiResponse = await response.json();
    
    if (!rawData.success || !rawData.data || rawData.data.length === 0) {
      return {
        ok: true,
        status: response.status,
        tableData: []
      };
    }

    // Transform raw data to table format with only required columns
    const tableData: TableRow[] = rawData.data.map(record => ({
      Name: record.Name || '',
      Email: record.Email || '',
      Phone: record.Phone || '',
      Id: record.Id || ''
    }));
    
    return {
      ok: true,
      status: response.status,
      tableData
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      ok: false,
      status: 500
    };
  }
};

export default api;
