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

const api = {
  baseUrl: "http://65.0.26.81:8000",
  endpoints: {
    posts: "/query",
  },
};

// Mock data for testing
const mockData: Record<string, ApiResponse> = {
  "1234567890": {
    phone: "1234567890",
    phoneDuplicates: ["ID_182", "ID_245", "ID_678"],
    email: "abc@mail.com",
    emailDuplicates: ["ID_909"]
  },
  "abc@mail.com": {
    phone: "1234567890",
    phoneDuplicates: ["ID_182", "ID_245", "ID_678"],
    email: "abc@mail.com",
    emailDuplicates: ["ID_909"]
  },
  "9876543210": {
    phone: "9876543210",
    phoneDuplicates: ["ID_101", "ID_202"],
    email: "test@example.com",
    emailDuplicates: ["ID_303", "ID_404", "ID_505"]
  },
  "test@example.com": {
    phone: "9876543210",
    phoneDuplicates: ["ID_101", "ID_202"],
    email: "test@example.com",
    emailDuplicates: ["ID_303", "ID_404", "ID_505"]
  }
};

export const submitQuery = async (formData: FormData): Promise<{
  ok: boolean;
  status: number;
  data: ApiResponse;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Check if mock data exists for the search value
  const mockResponse = mockData[formData.searchValue];

  if (mockResponse) {
    return {
      ok: true,
      status: 200,
      data: mockResponse
    };
  }

  // Return empty response if no match found
  return {
    ok: true,
    status: 200,
    data: {}
  };

  /* Uncomment this when real API is ready
  const response = await fetch(`${api.baseUrl}${api.endpoints.posts}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  const data = await response.json();
  
  return {
    ok: response.ok,
    status: response.status,
    data
  };
  */
};

export default api;
