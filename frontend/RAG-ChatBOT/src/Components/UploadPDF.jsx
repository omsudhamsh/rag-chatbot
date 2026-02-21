import { useState } from "react";
import axios from "axios";

export default function UploadPDF({ theme = "dark" }) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://127.0.0.1:8000/upload-pdf",
        formData
      );

      setUploadedFileName(file.name);
      alert("PDF uploaded!");
    } finally {
      setIsUploading(false);
    }
  };

  const cardClass =
    theme === "light"
      ? "rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-xl backdrop-blur-xl"
      : "rounded-2xl border border-white/15 bg-slate-900/45 p-5 shadow-xl backdrop-blur-xl";

  const headingClass = theme === "light" ? "text-lg font-medium text-slate-900" : "text-lg font-medium text-white";
  const subtitleClass = theme === "light" ? "text-sm text-slate-600" : "text-sm text-slate-300";
  const buttonClass =
    theme === "light"
      ? "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-300/70 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-100"
      : "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-300/30 bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-100 transition-all duration-200 hover:border-blue-200/60 hover:bg-blue-500/25 hover:text-white";

  const statusClass =
    theme === "light"
      ? "mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
      : "mt-3 rounded-lg border border-white/10 bg-slate-950/35 px-3 py-2 text-sm text-slate-200";

  return (
    <div className={cardClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={headingClass}>Upload Knowledge PDF</h2>
          <p className={subtitleClass}>Select one document to ingest before chatting.</p>
        </div>

        <label className={buttonClass}>
          <span>{isUploading ? "Uploading..." : "Choose File"}</span>
          <input type="file" accept=".pdf" onChange={upload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {(selectedFileName || uploadedFileName) && (
        <div className={statusClass}>
          {selectedFileName && (
            <p>
              Selected: <span className="font-medium">{selectedFileName}</span>
            </p>
          )}
          {uploadedFileName && (
            <p>
              Uploaded: <span className="font-medium">{uploadedFileName}</span> ✅
            </p>
          )}
        </div>
      )}
    </div>
  );
}