import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitQuery } from "../api/api";

export default function Form() {
  const [formData, setFormData] = useState({
    Email: "",
    LeadID: "",
    Phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form Data:", formData);
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      const result = await submitQuery(formData);

      if (result.ok && result.data.success) {
        console.log("Success:", result.data);
        setSuccess(true);
        setFormData({ Email: "", LeadID: "", Phone: "" });
      } else if (result.status === 422) {
        console.log("Validation Error:", result.data.message || result.data);
        setError(result.data.detail || result.data.message || "Validation error occurred");
      } else {
        console.log("Error:", result.data);
        setError(result.data.detail || result.data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm">
          Query submitted successfully!
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="Email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <Input 
          id="Email"
          type="email" 
          name="Email"
          placeholder="you@example.com" 
          value={formData.Email}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="LeadID" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Lead ID
        </label>
        <Input 
          id="LeadID"
          type="text" 
          name="LeadID"
          placeholder="Enter lead ID" 
          value={formData.LeadID}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="Phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Phone Number
        </label>
        <Input 
          id="Phone"
          type="tel" 
          name="Phone"
          placeholder="+1 (555) 000-0000" 
          value={formData.Phone}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit Query"
        )}
      </Button>
    </form>
  );
}
