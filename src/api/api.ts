interface FormData {
  searchBy: "phone" | "email" | "id";
  searchValue: string;
}

export interface TableRow {
  [key: string]: any;
}

interface RawApiResponse {
  success: boolean;
  data: Array<{
    [key: string]: any;
  }>;
}

const api = {
  baseUrl: "http://13.200.193.75:8000",
  endpoints: {
    query: "/query",
  },
};

export const submitQuery = async (formData: FormData): Promise<{
  ok: boolean;
  status: number;
  tableData?: TableRow[];
  rawData?: any[];
}> => {
  try {
    // Transform the request body to match API expectations
    // API expects: {"Id": null, "Email": "string", "Phone": "string"}
    const requestBody = {
      Id: formData.searchBy === "id" ? formData.searchValue : null,
      Email: formData.searchBy === "email" ? formData.searchValue : null,
      Phone: formData.searchBy === "phone" ? formData.searchValue : null
    };

    console.log("Sending request:", requestBody);

    const response = await fetch(`${api.baseUrl}${api.endpoints.query}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      return {
        ok: false,
        status: response.status
      };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Expected JSON but received:", textResponse.substring(0, 200));
      throw new Error("Server returned non-JSON response");
    }

    const rawData: RawApiResponse = await response.json();

    if (!rawData.success || !rawData.data || rawData.data.length === 0) {
      return {
        ok: true,
        status: response.status,
        tableData: [],
        rawData: []
      };
    }

    const tableData: TableRow[] = rawData.data;

    return {
      ok: true,
      status: response.status,
      tableData,
      rawData: rawData.data
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
