import React, { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

function buildDefaultItems({ onView, onEdit, onDelete, viewLabel, editLabel, deleteLabel }) {
  const items = [];
  if (onView) items.push({ label: viewLabel || "View", icon: "bx bx-show", onClick: onView });
  if (onEdit) items.push({ label: editLabel || "Edit", icon: "bx bx-edit", onClick: onEdit });
  if (onDelete) {
    items.push({
      label: deleteLabel || "Delete",
      icon: "bx bx-trash",
      onClick: onDelete,
      danger: true,
    });
  }
  return items;
}

export default function TableActionMenu({
  items,
  onEdit,
  onDelete,
  onView,
  editLabel,
  deleteLabel,
  viewLabel,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const menuItems = items?.length
    ? items
    : buildDefaultItems({ onView, onEdit, onDelete, viewLabel, editLabel, deleteLabel });

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!menuItems.length) return null;

  return (
    <div className="sdl-action-menu" ref={ref}>
      <button
        type="button"
        className="sdl-action-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        aria-expanded={open}
      >
        <BsThreeDotsVertical />
      </button>
      {open && (
        <div className="sdl-action-menu-dropdown" role="menu">
          {menuItems.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              className={`sdl-action-menu-item${item.danger ? " danger" : ""}`}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.icon && <i className={item.icon}></i>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
