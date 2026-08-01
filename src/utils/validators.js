/**
 * Shared form field validators for the School CRM UI.
 * Use for required / email / mobile checks across wizards, modals, and pages.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits only; optional leading +91 / 91 / 0 */
export const normalizeMobile = (value) => {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
};

/**
 * Restrict typing: digits only, max 10, first digit must be 6–9.
 * Use in onChange for all mobile/phone fields.
 */
export const sanitizeMobileInput = (value) => {
  let digits = String(value ?? "").replace(/\D/g, "");
  while (digits.length && !/^[6-9]/.test(digits)) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

export const isBlank = (value) =>
  value === null || value === undefined || String(value).trim() === "";

export const isEmailFieldName = (name = "") => /email/i.test(String(name));

export const isMobileFieldName = (name = "") =>
  /mobile|phone|contact_number|contactno|phoneno|driverphone|whatsapp|emergencycontact/i.test(
    String(name).replace(/[\s_]/g, "")
  );

export const requiredError = (label = "This field") =>
  `${label} is required.`;

export const validateRequired = (value, label = "This field") =>
  isBlank(value) ? requiredError(label) : "";

export const validateEmail = (
  value,
  { required = false, label = "Email" } = {}
) => {
  const s = String(value ?? "").trim();
  if (!s) return required ? requiredError(label) : "";
  if (!EMAIL_RE.test(s)) return `Enter a valid ${String(label).toLowerCase()}`;
  return "";
};

export const validateMobile = (
  value,
  { required = false, label = "Mobile number" } = {}
) => {
  const s = String(value ?? "").trim();
  if (!s) return required ? requiredError(label) : "";
  const digits = normalizeMobile(s);
  if (!/^[6-9]/.test(digits)) {
    return `${label} must start with 6, 7, 8 or 9`;
  }
  if (digits.length !== 10) {
    return `${label} must be exactly 10 digits`;
  }
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return `${label} must be a valid 10-digit number starting with 6–9`;
  }
  return "";
};

/**
 * Validate a single field by name convention (email* / mobile|phone*).
 * Empty values only fail when required=true.
 */
export const validateFormField = (
  name,
  value,
  { required = true, label } = {}
) => {
  const lbl = label || prettyLabel(name);
  if (isBlank(value)) return required ? requiredError(lbl) : "";
  if (isEmailFieldName(name)) return validateEmail(value, { required, label: lbl });
  if (isMobileFieldName(name)) return validateMobile(value, { required, label: lbl });
  return "";
};

export const prettyLabel = (name = "") =>
  String(name)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim() || "This field";

/**
 * @param {Array<{ name: string, label?: string, required?: boolean }>} fields
 * @param {Record<string, unknown>} values
 * @returns {Record<string, string>}
 */
export const validateFormValues = (fields, values = {}) => {
  const errors = {};
  (fields || []).forEach((field) => {
    if (!field?.name) return;
    const msg = validateFormField(field.name, values[field.name], {
      required: field.required !== false,
      label: field.label || prettyLabel(field.name),
    });
    if (msg) errors[field.name] = msg;
  });
  return errors;
};

/** First error message, for toast summaries */
export const firstErrorMessage = (errors = {}) => {
  const msgs = Object.values(errors).filter(Boolean);
  return msgs[0] || "Please fix the highlighted fields.";
};
