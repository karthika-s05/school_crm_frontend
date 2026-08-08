import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Reusable row-selection state for paginated tables.
 * Stores only unique row IDs.
 *
 * @param {object} options
 * @param {Array}  options.rows        Current page (or visible) rows
 * @param {string|function} [options.getRowId='id']  ID field name or getter
 * @param {any}    [options.resetKey]  Change this to clear selection (data reload)
 */
export default function useTableSelection({
  rows = [],
  getRowId = "id",
  resetKey,
} = {}) {
  const [selectedRows, setSelectedRows] = useState([]);

  const resolveId = useCallback(
    (row) => {
      if (typeof getRowId === "function") return getRowId(row);
      return row?.[getRowId];
    },
    [getRowId]
  );

  const pageIds = useMemo(
    () =>
      (Array.isArray(rows) ? rows : [])
        .map((row) => resolveId(row))
        .filter((id) => id !== undefined && id !== null && id !== ""),
    [rows, resolveId]
  );

  const pageIdSet = useMemo(() => new Set(pageIds.map(String)), [pageIds]);

  useEffect(() => {
    setSelectedRows([]);
  }, [resetKey]);

  // Drop stale IDs that are no longer in the current dataset page list
  // when pageIds empties after filter change — keep selection across pages
  // unless resetKey changes. Only prune when rows explicitly replace.

  const isSelected = useCallback(
    (id) => selectedRows.some((x) => String(x) === String(id)),
    [selectedRows]
  );

  const toggleRow = useCallback((id) => {
    if (id === undefined || id === null || id === "") return;
    setSelectedRows((prev) => {
      const exists = prev.some((x) => String(x) === String(id));
      if (exists) return prev.filter((x) => String(x) !== String(id));
      return [...prev, id];
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelectedRows((prev) => {
      const merged = new Map(prev.map((id) => [String(id), id]));
      pageIds.forEach((id) => merged.set(String(id), id));
      return [...merged.values()];
    });
  }, [pageIds]);

  const deselectAllOnPage = useCallback(() => {
    setSelectedRows((prev) =>
      prev.filter((id) => !pageIdSet.has(String(id)))
    );
  }, [pageIdSet]);

  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => isSelected(id));

  const somePageSelected =
    pageIds.some((id) => isSelected(id)) && !allPageSelected;

  const toggleSelectAll = useCallback(() => {
    if (allPageSelected) deselectAllOnPage();
    else selectAllOnPage();
  }, [allPageSelected, deselectAllOnPage, selectAllOnPage]);

  const clearSelection = useCallback(() => setSelectedRows([]), []);

  const selectedCount = selectedRows.length;
  const canEdit = selectedCount === 1;
  const canDelete = selectedCount >= 1;
  const singleSelectedId = canEdit ? selectedRows[0] : null;

  return {
    selectedRows,
    setSelectedRows,
    selectedCount,
    canEdit,
    canDelete,
    singleSelectedId,
    isSelected,
    toggleRow,
    toggleSelectAll,
    selectAllOnPage,
    deselectAllOnPage,
    clearSelection,
    allPageSelected,
    somePageSelected,
    pageIds,
  };
}
