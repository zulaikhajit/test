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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form Data:", formData);
    
    setLoading(true);
    
    try {
      const result = await submitQuery(formData);

      if (result.ok && result.data.success) {
        console.log("Success:", result.data);
      } else if (result.status === 422) {
        console.log("Validation Error:", result.data.message || result.data);
      } else {
        console.log("Error:", result.data);
      }
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Input 
        type="email" 
        name="Email"
        placeholder="Enter your email" 
        value={formData.Email}
        onChange={handleChange}
      />
      <Input 
        type="text" 
        name="LeadID"
        placeholder="Enter lead id" 
        value={formData.LeadID}
        onChange={handleChange}
      />
      <Input 
        type="tel" 
        name="Phone"
        placeholder="Enter your phone number" 
        value={formData.Phone}
        onChange={handleChange}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
