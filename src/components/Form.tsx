import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitQuery } from "../api/api";
import { Search, Download, Loader2,AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
// ✅ allow dynamic API structure
export type TableRow = Record<string, unknown>;

export default function Form() {
  const [searchBy, setSearchBy] = useState<"phone" | "email" | "id">("phone");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // ✅ dynamic CSV export - only selected columns
  const downloadCSV = () => {
    if (!tableData.length) return;

    // Only include these columns in CSV export
    const selectedColumns = [
      'Company',
      'LastName',
      'Country_Code__c',
      'MobilePhone',
      'Email',
      'LeadSource',
      'Secondary_Source__c',
      'Tertiary_Source__c',
      // 'Createddate',
      'Project_Interested__c'
    ];

    const csvRows: string[] = [];

    // 1️⃣ header row
    csvRows.push(selectedColumns.join(","));

    // 2️⃣ data rows
    tableData.forEach((row) => {
      console.log('row :>> ', row);
      const values = selectedColumns.map((column) => {
        let value = row[column];

        if (value === null || value === undefined) return "";

        if (["MobilePhone", "Country_Code__c"].includes(column)) {
          value = String(value).replace(/^\+/, ""); // removes only starting +
        }

        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      });

      csvRows.push(values.join(","));
    });

    // 3️⃣ download
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

      console.log('result :>> ', result);

      if (result.ok && result.rawData?.length) {
        setTableData(result.rawData);
      } else {
        setError("No Duplicate records found");
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
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm"
  >
    <div className="bg-red-100 p-2 rounded-full">
      <AlertCircle className="h-5 w-5 text-red-600" />
    </div>

    <p className="text-sm font-medium text-red-700">
      {error}
    </p>
  </motion.div>
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
                    {String(row.Company ?? "-")}
                  </td>
                  <td className="px-6 py-4">
                  {typeof row.MobilePhone === "string"
                    ? row.MobilePhone.replace(/^\+/, "")
                    : "-"}
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

// import { useState } from "react";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { submitQuery } from "../api/api";
// import { Search, Download, Loader2 } from "lucide-react";
// import { motion } from "framer-motion";

// export default function Form() {
//   const [searchBy, setSearchBy] = useState("phone");
//   const [searchValue, setSearchValue] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [tableData, setTableData] = useState([]);

//   const downloadCSV = () => {
//     if (!tableData.length) return;

//     const selectedColumns = [
//       "Company",
//       "LastName",
//       "Country_Code__c",
//       "MobilePhone",
//       "Email",
//       "LeadSource",
//       "Secondary_Source__c",
//       "Tertiary_Source__c",
//       "Project_Interested__c",
//     ];

//     const csvRows = [];
//     csvRows.push(selectedColumns.join(","));

//     tableData.forEach((row) => {
//       const values = selectedColumns.map((column) => {
//         let value = row[column];
//         if (!value) return "";

//         if (["MobilePhone", "Country_Code__c"].includes(column)) {
//           value = String(value).replace(/^\+/, "");
//         }

//         return `"${String(value).replace(/"/g, '""')}"`;
//       });

//       csvRows.push(values.join(","));
//     });

//     const blob = new Blob([csvRows.join("\n")], {
//       type: "text/csv;charset=utf-8;",
//     });

//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `leads.csv`;
//     link.click();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!searchValue.trim()) return setError("Enter value");

//     setLoading(true);
//     setError("");
//     setTableData([]);

//     try {
//       const result = await submitQuery({ searchBy, searchValue });
//       if (result.ok && result.rawData?.length) {
//         setTableData(result.rawData);
//       } else setError("No records found");
//     } catch {
//       setError("Error fetching data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-3 max-w-1xl mx-auto">
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white shadow-xl rounded-2xl p-6 border border-yellow-200"
//       >
//         <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
//           <select
//             value={searchBy}
//             onChange={(e) => setSearchBy(e.target.value)}
//             className="h-11 px-4 rounded-xl border focus:ring-2 focus:ring-yellow-400"
//           >
//             <option value="phone">Phone</option>
//             <option value="email">Email</option>
//             <option value="id">Lead ID</option>
//           </select>

//           <Input
//             className="flex-1 h-11 rounded-xl focus:ring-2 focus:ring-yellow-400"
//             placeholder="Enter value..."
//             value={searchValue}
//             onChange={(e) => setSearchValue(e.target.value)}
//           />

//           <Button className="bg-yellow-400 hover:bg-yellow-500 rounded-xl px-6">
//             {loading ? (
//               <Loader2 className="animate-spin" />
//             ) : (
//               <Search />
//             )}
//           </Button>

//           {tableData.length > 0 && (
//             <Button
//               type="button"
//               onClick={downloadCSV}
//               className="bg-black text-white rounded-xl px-6"
//             >
//               <Download />
//             </Button>
//           )}
//         </form>

//         {error && (
//           <p className="text-red-500 mt-4 animate-pulse">{error}</p>
//         )}
//       </motion.div>

//       {tableData.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="mt-6 overflow-hidden rounded-2xl shadow-lg"
//         >
//           <table className="w-full text-sm">
//             <thead className="bg-yellow-400 text-black">
//               <tr>
//                 <th className="p-4">ID</th>
//                 <th>Name</th>
//                 <th>Phone</th>
//                 <th>Email</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tableData.map((row, i) => (
//                 <motion.tr
//                   key={i}
//                   whileHover={{ scale: 1.01 }}
//                   className="border-b hover:bg-yellow-50 transition"
//                 >
//                   <td className="p-4">{row.Id}</td>
//                   <td>{row.LastName}</td>
//                   <td>{row.MobilePhone?.slice(1)}</td>
//                   <td>{row.Email}</td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </motion.div>
//       )}
//     </div>
//   );
// }
