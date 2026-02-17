import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitQuery, type TableRow } from "../api/api";
import { Search, Download, Loader2 } from "lucide-react";

export default function Form() {
  const [searchBy, setSearchBy] = useState<"phone" | "email" | "id">("phone");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  const downloadCSV = () => {
    if (!tableData || tableData.length === 0) return;

    const headers = ['Lead ID', 'Name', 'Phone', 'Email'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    tableData.forEach(record => {
      const values = [record.Id, record.Name, record.Phone, record.Email].map(value => {
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

    // Validate phone number - should only contain digits, +, -, (, ), and spaces
    if (searchBy === "phone") {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(searchValue.trim())) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    setLoading(true);
    setError("");
    setTableData([]);
    
    try {
      const result = await submitQuery({
        searchBy,
        searchValue: searchValue.trim()
      });

      if (result.ok && result.tableData && result.tableData.length > 0) {
        setTableData(result.tableData);
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
              onChange={(e) => setSearchBy(e.target.value as "phone" | "email" | "id")}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="id">Lead ID</option>
            </select>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label htmlFor="searchValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {searchBy === "phone" ? "Phone Number" : searchBy === "email" ? "Email Address" : "Lead ID"}
            </label>
            <Input 
              id="searchValue"
              type={searchBy === "phone" ? "tel" : searchBy === "email" ? "email" : "text"}
              name="searchValue"
              placeholder={searchBy === "phone" ? "1234567890" : searchBy === "email" ? "abc@mail.com" : "00Qfu00000MxasPEAR"}
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

          {tableData.length > 0 && (
            <Button 
              type="button"
              onClick={downloadCSV}
              className="px-8"
            >
              <Download className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}
      </form>

      {tableData.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{tableData.length}</span> duplicate records for: 
              <span className="font-semibold text-slate-900 dark:text-white ml-1">
                {searchBy === "phone" ? "Phone" : searchBy === "email" ? "Email" : "Lead ID"} → {searchValue}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-3">Lead ID</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Phone</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                      {row.Id || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {row.Name || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {row.Phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {row.Email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
