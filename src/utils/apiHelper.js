import { toast } from "react-toastify";

export const handleApiResponse = (res, successMsg) => {
  // Master helpers like getClass/getSection return the data array directly.
  if (Array.isArray(res)) {
    if (successMsg) toast.success(successMsg);
    return res;
  }
  if (res?.status === "success" || res?.status === "Success") {
    if (successMsg) toast.success(successMsg);
    return res;
  }
  // toast.error(res?.message || "Request failed");
  return null;
};

export const runApi = async (fn, { successMsg, onSuccess, onError } = {}) => {
  try {
    const res = await fn();
    const ok = handleApiResponse(res, successMsg);
    if (ok && onSuccess) onSuccess(ok);
    if (!ok && onError) onError(res);
    return ok;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.data ||
      err?.message ;
    // toast.error(typeof msg === "string" ? msg : "Request failed");
    if (onError) onError(err);
    return null;
  }
};

export const downloadCsv = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
