const api = {
  baseUrl: "http://65.0.26.81:8000",
  endpoints: {
    posts: "/query",
    // posts: "/posts",
  },
};

export const submitQuery = async (formData) => {
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
};

export default api;
