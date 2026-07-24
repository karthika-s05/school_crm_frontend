import React from "react";

const pageWindow = (page, totalPages, max = 7) => {
  if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
  let start = Math.max(1, page - Math.floor(max / 2));
  const end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const Pagination = ({ page, setPage, total, pageSize }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="av2-pagination">
      <span className="av2-page-info">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="av2-page-btns">
        <button className="av2-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <i className="bx bx-chevron-left"></i>
        </button>
        {pageWindow(page, totalPages).map((p) => (
          <button
            key={p}
            className={`av2-page-btn${page === p ? " active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="av2-page-btn"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          <i className="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
