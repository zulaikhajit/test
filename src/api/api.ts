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

    // Expand duplicate records into separate rows
    const tableData: TableRow[] = [];
    
    rawData.data.forEach((record) => {
      // Extract duplicate IDs from phone_row_duplicate_id_remark
      const phoneDuplicateMatch = record.phone_row_duplicate_id_remark?.match(/\[(.*?)\]/);
      const duplicateIds = phoneDuplicateMatch 
        ? phoneDuplicateMatch[1].split(', ').map((id: string) => id.trim())
        : [record.Id];

      // Extract duplicate emails from email_row_duplicate_position
      const emailDuplicateMatch = record.email_row_duplicate_position?.match(/\[(.*?)\]/);
      const duplicateEmails = emailDuplicateMatch 
        ? emailDuplicateMatch[1].split(', ').map((email: string) => email.trim())
        : [record.Email];

      // Create a row for each duplicate combination
      const maxDuplicates = Math.max(duplicateIds.length, duplicateEmails.length);
      
      for (let i = 0; i < maxDuplicates; i++) {
        tableData.push({
          ...record,
          Id: duplicateIds[i] || record.Id,
          Email: duplicateEmails[i] || record.Email
        });
      }
    });

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
