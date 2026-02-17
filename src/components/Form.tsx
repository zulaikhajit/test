import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitQuery } from "../api/api";
import { Search, Download, Loader2 } from "lucide-react";

interface ApiResponse {
  phones?: Array<{ phone: string; ids: string[] }>;
  emails?: Array<{ email: string; ids: string[] }>;
}

export default function Form() {
  const [searchBy, setSearchBy] = useState<"phone" | "email">("phone");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);

  const downloadCSV = () => {
    if (!rawData || rawData.length === 0) return;

    // Get all unique keys from all records
    const allKeys = new Set<string>();
    rawData.forEach(record => {
      Object.keys(record).forEach(key => allKeys.add(key));
    });
    const headers = Array.from(allKeys);

    // Create CSV content
    const csvRows = [];
    csvRows.push(headers.join(','));

    rawData.forEach(record => {
      const values = headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${searchBy}_${searchValue}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!searchValue.trim()) {
      setError("Please enter a value to search");
      return;
    }

    setLoading(true);
    setError("");
    setResponseData(null);
    
    try {
      const result = await submitQuery({
        searchBy,
        searchValue: searchValue.trim()
      });

      if (result.ok) {
        setResponseData(result.data);
        setRawData(result.rawData || []);
        
        const hasPhones = result.data.phones && result.data.phones.length > 0;
        const hasEmails = result.data.emails && result.data.emails.length > 0;
        
        if (!hasPhones && !hasEmails) {
          setError("No duplicate records found");
        }
      } else {
        setError("No records found");
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
            <label htmlFor="searchBy" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Search By
            </label>
            <select
              id="searchBy"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as "phone" | "email")}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label htmlFor="searchValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {searchBy === "phone" ? "Phone Number" : "Email Address"}
            </label>
            <Input 
              id="searchValue"
              type={searchBy === "phone" ? "tel" : "email"}
              name="searchValue"
              placeholder={searchBy === "phone" ? "1234567890" : "abc@mail.com"}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setError("");
              }}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="px-8"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>

          {rawData.length > 0 && (
            <Button 
              type="button"
              onClick={downloadCSV}
              className="px-8"
            >
              {/* <Download className="mr-1 h-4 w-4" /> */}
                <Download className="mr-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}
      </form>

      {responseData && (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Showing results for: <span className="font-semibold text-slate-900 dark:text-white">
                {searchBy === "phone" ? "Phone" : "Email"} → {searchValue}
              </span>
            </p>
          </div>

          {/* Single entry layout - side by side */}
          {((responseData.phones?.length === 1 && responseData.emails?.length === 1) ||
            (responseData.phones?.length === 1 && !responseData.emails) ||
            (!responseData.phones && responseData.emails?.length === 1)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Details Card */}
              {responseData.phones && responseData.phones.length === 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Phone Details
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Phone:</p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">{responseData.phones[0].phone}</p>
                  </div>

                  {responseData.phones[0].ids.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Duplicate Lead IDs ({responseData.phones[0].ids.length})
                      </p>
                      <ul className="space-y-1">
                        {responseData.phones[0].ids.map((id, index) => (
                          <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="font-mono text-sm">{id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Email Details Card */}
              {responseData.emails && responseData.emails.length === 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Email Details
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email:</p>
                    <p className="text-base font-medium text-slate-900 dark:text-white break-all">{responseData.emails[0].email}</p>
                  </div>

                  {responseData.emails[0].ids.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Duplicate Lead IDs ({responseData.emails[0].ids.length})
                      </p>
                      <ul className="space-y-1">
                        {responseData.emails[0].ids.map((id, index) => (
                          <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            <span className="font-mono text-sm">{id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Multiple entries layout - stacked with headers */}
          {((responseData.phones && responseData.phones.length > 1) || 
            (responseData.emails && responseData.emails.length > 1)) && (
            <div className="grid grid-cols-1 gap-4">
              {/* Phone Details Cards */}
              {responseData.phones && responseData.phones.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Phone Details ({responseData.phones.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {responseData.phones.map((phoneData, index) => (
                      <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-5">
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Phone:</p>
                          <p className="text-base font-medium text-slate-900 dark:text-white">{phoneData.phone}</p>
                        </div>

                        {phoneData.ids.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Duplicate Lead IDs ({phoneData.ids.length})
                            </p>
                            <ul className="space-y-1">
                              {phoneData.ids.map((id, idIndex) => (
                                <li key={idIndex} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  <span className="font-mono text-sm">{id}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Details Cards */}
              {responseData.emails && responseData.emails.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    Email Details ({responseData.emails.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {responseData.emails.map((emailData, index) => (
                      <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-5">
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email:</p>
                          <p className="text-base font-medium text-slate-900 dark:text-white break-all">{emailData.email}</p>
                        </div>

                        {emailData.ids.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Duplicate Lead IDs ({emailData.ids.length})
                            </p>
                            <ul className="space-y-1">
                              {emailData.ids.map((id, idIndex) => (
                                <li key={idIndex} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                  <span className="font-mono text-sm">{id}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
