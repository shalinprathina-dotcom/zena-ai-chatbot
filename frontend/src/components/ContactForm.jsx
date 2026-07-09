import { useState } from "react";

export default function ContactForm({
  fields = [],
  onSubmit,
  disabled = false,
}) {
  const [formData, setFormData] = useState(
    Object.fromEntries(fields.map((field) => [field, ""]))
  );

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isLongField = (field) => {
    const name = field.toLowerCase();

    return (
      name.includes("requirement") ||
      name.includes("enquiry") ||
      name.includes("interest") ||
      name.includes("message") ||
      name.includes("description")
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allFilled = fields.every(
      (field) => formData[field]?.trim() !== ""
    );

    if (!allFilled) {
      alert("Please fill all the fields.");
      return;
    }

    // Phone Number Validation (only if a phone field exists on this form)
    const phoneField = fields.find((field) =>
      field.toLowerCase().includes("phone")
    );

    if (phoneField && formData[phoneField].trim().length !== 10) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    onSubmit(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          padding: "15px",
          background: "#ECFDF5",
          border: "1px solid #10B981",
          borderRadius: "10px",
          color: "#065F46",
          fontWeight: "600",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        ✅ Thank you! Your details have been submitted successfully.
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field}>
          <label>{field}</label>

          {isLongField(field) ? (
            <textarea
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter ${field}`}
              disabled={disabled}
              required
            />
          ) : (
            <input
              type={
                field.toLowerCase().includes("email")
                  ? "email"
                  : field.toLowerCase().includes("phone")
                  ? "tel"
                  : "text"
              }
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter ${field}`}
              disabled={disabled}
              required
            />
          )}
        </div>
      ))}

      <button type="submit" className="form-submit-btn" disabled={disabled}>
        Submit Details
      </button>
    </form>
  );
}