import React from "react";


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Adjust this value to change the number of visible pages

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);
      let startPage, endPage;

      if (currentPage <= halfMaxVisiblePages) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + halfMaxVisiblePages >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfMaxVisiblePages;
        endPage = currentPage + halfMaxVisiblePages;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers.map((number) => (
      <a
        key={number}
        onClick={() => onPageChange(number)}
        className={currentPage === number ? "active" : ""}
      >
        {number}
      </a>
    ));
  };

  return (
    <div className="pagination">
      <a onClick={() => onPageChange("prev")}>&laquo;</a>
      {renderPageNumbers()}
      <a onClick={() => onPageChange("next")}>&raquo;</a>
    </div>
  );
};

export default Pagination;
