import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
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
  const [responseData, setResponseData] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess(false);
  };

  const downloadCSV = () => {
    if (!responseData || responseData.length === 0) return;

    // Get headers
    const headers = Object.keys(responseData[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...responseData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle empty values and escape commas/quotes
          const stringValue = value === null || value === undefined || value === '' ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lead_query_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        setResponseData(result.data.data || []);
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
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="Email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <Input 
              id="Email"
              type="email" 
              name="Email"
              placeholder="you@example.com" 
              value={formData.Email}
              onChange={handleChange}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="LeadID" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lead ID
            </label>
            <Input 
              id="LeadID"
              type="text" 
              name="LeadID"
              placeholder="Enter lead ID" 
              value={formData.LeadID}
              onChange={handleChange}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="Phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <Input 
              id="Phone"
              type="tel" 
              name="Phone"
              placeholder="+1 (555) 000-0000" 
              value={formData.Phone}
              onChange={handleChange}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="px-8"
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
              "Submit"
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm mt-4">
            Query submitted successfully!
          </div>
        )}
      </form>

      {responseData && responseData.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Query Results
            </h3>
            <Button 
              type="button"
              onClick={downloadCSV}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </Button>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto blue-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900">
                  <TableRow>
                    {Object.keys(responseData[0]).map((key) => (
                      <TableHead key={key} className="font-semibold whitespace-nowrap">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responseData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, idx) => (
                        <TableCell key={idx} className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
