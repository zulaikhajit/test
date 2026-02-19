import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitQuery } from "../api/api";
import { Search, Download, Loader2 } from "lucide-react";

// ✅ allow dynamic API structure
export type TableRow = Record<string, unknown>;

export default function Form() {
  const [searchBy, setSearchBy] = useState<"phone" | "email" | "id">("phone");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // ✅ dynamic CSV export
  const downloadCSV = () => {
    if (!tableData.length) return;

    // Fields to exclude from CSV export
    const excludedFields = [
      'Phone_cleansed', 'MobilePhone_cleansed', 'WA_Formatted_Phone__c_cleansed',
      'Encrypted_SMobile__c_cleansed', 'Mobile_Phone__c_cleansed', 'Phone__c_cleansed',
      'Mobile3__c_cleansed', 'Mobile4__c_cleansed', 'Mobile5__c_cleansed',
      'Mobile6__c_cleansed', 'Mobile7__c_cleansed', 'Mobile8__c_cleansed',
      'Mobile9__c_cleansed', 'Mobile10__c_cleansed', 'invalid_numbers',
      'invalid_number_count', 'Invalid_mobile', 'doubtful_numbers',
      'doubtful_number_count', 'doubtful_mobile', 'Email_cleansed',
      'Secondary_Email__c_cleansed', 'primary_valid_email_format',
      'primary_invalid_email_format_comments', 'secondary_valid_email_format',
      'secondary_invalid_email_format_comments', 'row_duplicate_phone',
      'row_duplication', 'row_duplicate_position', 'row_duplicate_count',
      'column_duplication', 'column_duplicate_flag', 'column_duplicate_count',
      'column_duplicate_numbers', 'column_duplicate_remark', 'row_duplicate_flag'
    ];

    // 1️⃣ collect all unique headers from all rows, excluding unwanted fields
    const allHeaders = Array.from(
      new Set(tableData.flatMap((row) => Object.keys(row)))
    );
    
    const headers = allHeaders.filter(header => !excludedFields.includes(header));

    const csvRows: string[] = [];

    // 2️⃣ header row
    csvRows.push(headers.join(","));

    // 3️⃣ data rows
    tableData.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];

        if (value === null || value === undefined) return "";

        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      });

      csvRows.push(values.join(","));
    });

    // 4️⃣ download
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `leads_${searchBy}_${searchValue}_${
      new Date().toISOString().split("T")[0]
    }.csv`;

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
        searchValue: searchValue.trim(),
      });

      if (result.ok && result.tableData?.length) {
        setTableData(result.tableData);
      } else {
        setError("No records found");
      }
    } catch (err) {
      console.error("Request failed:", err);
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
            <label className="block text-sm font-medium mb-1">Search By</label>
            <select
              value={searchBy}
              onChange={(e) =>
                setSearchBy(e.target.value as "phone" | "email" | "id")
              }
              className="w-full h-10 px-3 rounded-md border"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="id">Lead ID</option>
            </select>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium mb-1">
              {searchBy === "phone"
                ? "Phone Number"
                : searchBy === "email"
                ? "Email Address"
                : "Lead ID"}
            </label>

            <Input
              type={
                searchBy === "phone"
                  ? "tel"
                  : searchBy === "email"
                  ? "email"
                  : "text"
              }
              placeholder={
                searchBy === "phone"
                  ? "1234567890"
                  : searchBy === "email"
                  ? "abc@mail.com"
                  : "00Qfu00000MxasPEAR"
              }
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setError("");
              }}
            />
          </div>

          <Button type="submit" disabled={loading} className="px-8">
            {loading ? (
              <span className="flex items-center gap-2">
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
            <Button type="button" onClick={downloadCSV} className="px-8">
              <Download className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-4">{error}</div>
        )}
      </form>

      {/* 🔹 keep your existing table if you only want to show 4 fields in UI */}
      {tableData.length > 0 && (
        <div className="mt-6 overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3">Lead ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-4 font-mono">
                    {String(row.Id ?? "-")}
                  </td>
                  <td className="px-6 py-4">
                    {String(row.Name ?? "-")}
                  </td>
                  <td className="px-6 py-4">
                    {String(row.Phone ?? "-")}
                  </td>
                  <td className="px-6 py-4">
                    {String(row.Email ?? "-")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}