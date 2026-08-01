import React, { useState, useEffect, useCallback } from "react";
import "../List/StudentDummyList.css";
import "./services.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import {
  getClass,
  getSection,
  getStationery,
  postStationery,
  updateStationery,
  deleteStationery,
  getstudentStationerys,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { toast } from "react-toastify";

const CATEGORIES = ["All","Stationery","Instrument","Art","Uniform"];
const TABS = ["Inventory","Issue Tracker","Add Product"];
const PER_PAGE = 8;
const AV_COLORS = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];
const initials = n => (n || "").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

const EMPTY_PRODUCT = { name:"", category:"Stationery", unitPrice:"", stock:"", reorder:"", unit:"Piece", supplier:"", status:"In Stock" };

const deriveStatus = (stock, reorder = 20) => {
  const st = Number(stock);
  const re = Number(reorder) || 20;
  if (st === 0) return "Out of Stock";
  if (st <= re) return "Low Stock";
  return "In Stock";
};

const mapApiProduct = (item) => {
  const stock = Number(item.total ?? item.stock ?? 0);
  const reorder = Number(item.reorder ?? 20);
  return {
    id: item.id,
    name: item.product ?? item.name ?? "-",
    category: item.category ?? "Stationery",
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    stock,
    reorder,
    unit: item.unit ?? "Piece",
    supplier: item.supplier ?? "-",
    status: item.status ?? deriveStatus(stock, reorder),
    classId: item.classId,
    sectionId: item.sectionId,
    _raw: item,
  };
};

const mapApiOrder = (item, classLabel) => {
  const pending = Number(item.pending ?? 0);
  const issue = Number(item.issue ?? 0);
  const total = Number(item.total ?? 0);
  return {
    id: item.id ?? item.studentId,
    admNo: item.studentId ?? item.admissionNo ?? "-",
    student: item.studentName ?? item.student ?? "-",
    cls: classLabel,
    items: [{ productId: item.id, productName: item.product, qty: issue || total }],
    date: item.date ?? item.issueDate ?? "-",
    total,
    status: pending > 0 ? "Pending" : "Issued",
    _raw: item,
  };
};

export default function Stationery() {
  const [tab, setTab]         = useState(0);
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("All");
  const [statusFilter, setSt] = useState("All");
  const [orderFilter, setOf]  = useState("All");
  const [page, setPage]       = useState(1);
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [classes, setClasses]   = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId]   = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [addForm, setAddForm]   = useState(EMPTY_PRODUCT);
  const [addErrors, setAddErrors] = useState({});

  const fc = v => setForm(p=>({...p,...v}));
  const fa = v => setAddForm(p=>({...p,...v}));

  const fetchProducts = useCallback(async (cId, sId) => {
    const token = getToken();
    if (!token || !cId || !sId) return;
    const res = await getStationery({ id: 0, classId: cId, sectionId: sId }, token);
    const list = Array.isArray(res?.data) ? res.data : [];
    setProducts(list.map(mapApiProduct));
  }, []);

  const fetchOrders = useCallback(async (cId, sId) => {
    const token = getToken();
    if (!token || !cId || !sId) return;
    const res = await getstudentStationerys(
      { userName: "0", classId: cId, sectionId: sId },
      token
    );
    const list = Array.isArray(res?.data) ? res.data : [];
    const c = classes.find((x) => x.id === cId);
    const s = sections.find((x) => x.id === sId);
    const label = c && s ? `${c.name}-${s.name}` : "-";
    setOrders(list.map((item) => mapApiOrder(item, label)));
  }, [classes, sections]);

  const reload = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    try {
      await Promise.all([fetchProducts(classId, sectionId), fetchOrders(classId, sectionId)]);
    } catch {
      toast.error("Could not load stationery data");
    } finally {
      setLoading(false);
    }
  }, [classId, sectionId, fetchProducts, fetchOrders]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadFilters = async () => {
      try {
        const [classRes, sectionRes] = await Promise.all([
          getClass(0, token).catch(() => []),
          getSection(0, token).catch(() => []),
        ]);
        const classList = (Array.isArray(classRes) ? classRes : []).map((c) => ({
          id: c.id,
          name: c.name ?? c.className ?? String(c.id),
        }));
        const sectionList = (Array.isArray(sectionRes) ? sectionRes : []).map((s) => ({
          id: s.id,
          name: s.name ?? s.sectionName ?? String(s.id),
        }));
        setClasses(classList);
        setSections(sectionList);
        if (classList.length) setClassId(classList[0].id);
        if (sectionList.length) setSectionId(sectionList[0].id);
      } catch {
        toast.error("Could not load class filters");
        setLoading(false);
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    if (classId && sectionId) reload();
  }, [classId, sectionId, reload]);

  const inStock  = products.filter(p=>p.status==="In Stock").length;
  const lowStock = products.filter(p=>p.status==="Low Stock").length;
  const outStock = products.filter(p=>p.status==="Out of Stock").length;
  const totalVal = products.reduce((s,p)=>s+p.unitPrice*p.stock,0);

  const filtProducts = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==="All" || p.category===catFilter;
    const mst= statusFilter==="All" || p.status===statusFilter;
    return ms && mc && mst;
  });
  const totalPgs = Math.ceil(filtProducts.length/PER_PAGE) || 1;
  const paged    = filtProducts.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const filtOrders = orders.filter(o =>
    (o.student.toLowerCase().includes(search.toLowerCase()) || o.admNo.toLowerCase().includes(search.toLowerCase())) &&
    (orderFilter==="All" || o.status===orderFilter)
  );

  const openEdit = p => { setForm({...p}); setEditingId(p.id); setModal("edit"); };
  const openView = p => { setForm({...p}); setModal("view"); };

  const saveEdit = () => {
    if (!form.name) return;
    const token = getToken();
    if (!token) return;
    const body = {
      id: editingId,
      product: form.name,
      total: Number(form.stock) || 0,
      classId,
      sectionId,
    };
    runApi(() => updateStationery(body, token), {
      successMsg: "Product updated",
      onSuccess: () => {
        setModal(null);
        reload();
      },
    });
  };

  const deleteProduct = (id) => {
    const token = getToken();
    if (!token) return;
    runApi(() => deleteStationery(id, token), {
      successMsg: "Product deleted",
      onSuccess: () => {
        setDeletingId(null);
        reload();
      },
    });
  };

  const toggleOrder = () => {
    toast.info("Order status is managed via student stationery records");
  };

  const validateAdd = () => {
    const e = {};
    if (!addForm.name.trim())       e.name = "Product name is required";
    if (!addForm.stock && addForm.stock!==0) e.stock = "Stock quantity is required";
    if (!classId || !sectionId)     e.class = "Class and section are required";
    return e;
  };

  const submitAdd = () => {
    const e = validateAdd();
    if (Object.keys(e).length) { setAddErrors(e); return; }
    const token = getToken();
    if (!token) return;
    const body = {
      product: addForm.name.trim(),
      total: Number(addForm.stock) || 0,
      classId,
      sectionId,
    };
    runApi(() => postStationery(body, token), {
      successMsg: "Product added",
      onSuccess: () => {
        setAddForm(EMPTY_PRODUCT);
        setAddErrors({});
        setTab(0);
        reload();
      },
    });
  };

  const switchTab = i => { setTab(i); setSearch(""); setPage(1); setCat("All"); setSt("All"); setOf("All"); };

  const statusColor = s => s==="In Stock"?"#22c55e":s==="Low Stock"?"#d97706":"#ef4444";
  const statusBg    = s => s==="In Stock"?"#f0fdf4":s==="Low Stock"?"#fef3c7":"#fef2f2";

  return (
    <div className="sdl-wrap">

      {/*  Stats  */}
      <div className="sdl-stats" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        {[
          { label:"Total Products",  val:products.length, icon:"bx bxs-box",          color:"#2D3A8C", bg:"#eef0fb" },
          { label:"In Stock",        val:inStock,         icon:"bx bxs-check-circle",  color:"#22c55e", bg:"#f0fdf4" },
          { label:"Low / Out Stock", val:`${lowStock} / ${outStock}`, icon:"bx bxs-error-circle", color:"#d97706", bg:"#fef3c7" },
          { label:"Inventory Value", val:`₹${(totalVal/1000).toFixed(1)}K`, icon:"bx bxs-wallet-alt", color:"#7c3aed", bg:"#f5f3ff" },
        ].map((s,i)=>(
          <div className="sdl-stat-card" key={i}>
            <div className="sdl-stat-icon" style={{ background:s.bg,color:s.color }}><i className={s.icon}></i></div>
            <div><div className="sdl-stat-val">{s.val}</div><div className="sdl-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/*  Tabs  */}
      <div className="svc-header">
        <div className="svc-tabs">
          {TABS.map((t,i)=>(
            <button key={i} className={`svc-tab${tab===i?" active":""}`} onClick={()=>switchTab(i)}>{t}</button>
          ))}
        </div>
          {/*  Class / Section filters  */}
        <div className="sdl-header" style={{ marginBottom: 12 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <select
              className="svc-select"
              value={classId ?? ""}
              onChange={(e) => { setClassId(Number(e.target.value)); setPage(1); }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="svc-select"
              value={sectionId ?? ""}
              onChange={(e) => { setSectionId(Number(e.target.value)); setPage(1); }}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {tab===0 && (
        <>
          <div className="sdl-header">
            <div className="sdl-search">
              <i className="bx bx-search"></i>
              <input placeholder="Search product or supplier…" value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}/>
              {search && (
                <i className="bx bx-x sdl-search-clear" onClick={() => { setSearch(""); setPage(1); }} />
              )}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <select className="svc-select" value={catFilter} onChange={e=>{ setCat(e.target.value); setPage(1); }}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
              <select className="svc-select" value={statusFilter} onChange={e=>{ setSt(e.target.value); setPage(1); }}>
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button className="sdl-add-btn" onClick={()=>switchTab(2)}><i className="bx bx-plus"></i> Add Product</button>
            </div>
          </div>

          <div className="sdl-table-card">
            <table className="sdl-table">
              <thead><tr>
                <th>#</th><th>Product Name</th><th>Category</th><th>Unit Price</th>
                <th>Stock</th><th>Reorder Level</th><th>Supplier</th><th>Status</th><th className="sdl-th-action">Action</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="sdl-empty"><i className="bx bx-loader-alt bx-spin"></i><span>Loading…</span></td></tr>
                ) : paged.length===0 ? (
                  <tr><td colSpan={9} className="sdl-empty"><i className="bx bx-search-alt"></i><span>No products found</span></td></tr>
                ) : paged.map((p,i)=>(
                  <tr key={p.id}>
                    <td className="sdl-num">{(page-1)*PER_PAGE+i+1}</td>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div className="svc-prod-icon" style={{ background:AV_COLORS[p.id%AV_COLORS.length]+"22",color:AV_COLORS[p.id%AV_COLORS.length] }}>
                          <i className="bx bxs-box"></i>
                        </div>
                        <div>
                          <div className="sdl-name">{p.name}</div>
                          <div className="sdl-email">{p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="svc-cat-badge">{p.category}</span></td>
                    <td><strong>₹{p.unitPrice}</strong></td>
                    <td>
                      <span className={p.stock===0?"svc-stock-zero":p.stock<=p.reorder?"svc-stock-low":"svc-stock-ok"}>
                        {p.stock}
                      </span>
                    </td>
                    <td>{p.reorder}</td>
                    <td className="sdl-mobile">{p.supplier}</td>
                    <td>
                      <span className="sdl-status" style={{ background:statusBg(p.status), color:statusColor(p.status) }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="sdl-td-action">
                      <TableActionMenu
                        onView={() => openView(p)}
                        onEdit={() => openEdit(p)}
                        onDelete={() => setDeletingId(p.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPgs>1 && (
            <div className="sdl-pagination">
              <span className="sdl-page-info">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtProducts.length)} of {filtProducts.length}</span>
              <div className="sdl-page-btns">
                <button className="sdl-page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}><i className="bx bx-chevron-left"></i></button>
                {Array.from({length:totalPgs},(_,i)=>i+1).map(p=>(
                  <button key={p} className={`sdl-page-btn${page===p?" active":""}`} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button className="sdl-page-btn" disabled={page===totalPgs} onClick={()=>setPage(p=>p+1)}><i className="bx bx-chevron-right"></i></button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════ TAB 1 – Issue Tracker ════════════ */}
      {tab===1 && (
        <>
          <div className="sdl-header">
            <div className="sdl-search">
              <i className="bx bx-search"></i>
              <input placeholder="Search student or admission no…" value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && (
                <i className="bx bx-x sdl-search-clear" onClick={() => setSearch("")} />
              )}
            </div>
            <select className="svc-select" value={orderFilter} onChange={e=>setOf(e.target.value)}>
              <option value="All">All Orders</option>
              <option value="Issued">Issued</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="sdl-table-card">
            <table className="sdl-table">
              <thead><tr>
                <th>#</th><th>Student</th><th>Class</th><th>Items</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="sdl-empty"><i className="bx bx-loader-alt bx-spin"></i><span>Loading…</span></td></tr>
                ) : filtOrders.length===0 ? (
                  <tr><td colSpan={8} className="sdl-empty"><i className="bx bx-search-alt"></i><span>No orders found</span></td></tr>
                ) : filtOrders.map((o,i)=>{
                  const itemSummary = o.items.map(it =>
                    it.productName ? `${it.productName} ×${it.qty}` : "Unknown"
                  ).join(", ");
                  return (
                    <tr key={o.id}>
                      <td className="sdl-num">{i+1}</td>
                      <td>
                        <div className="sdl-student-cell">
                          <div className="sdl-avatar" style={{ background:AV_COLORS[o.id%AV_COLORS.length] }}>{initials(o.student)}</div>
                          <div><div className="sdl-name">{o.student}</div><div className="sdl-email">{o.admNo}</div></div>
                        </div>
                      </td>
                      <td><span className="sdl-class-badge">{o.cls}</span></td>
                      <td>
                        <div className="svc-items-cell" title={itemSummary}>
                          {o.items.length} item{o.items.length>1?"s":""}
                          <span className="svc-items-tip">{itemSummary}</span>
                        </div>
                      </td>
                      <td className="sdl-dob">{o.date}</td>
                      <td><strong>₹{o.total}</strong></td>
                      <td>
                        <span className={`sdl-status ${o.status.toLowerCase()}`}>{o.status}</span>
                      </td>
                      <td>
                        <button className={`svc-toggle-btn${o.status==="Issued"?" svc-toggle-unpaid":" svc-toggle-paid"}`} onClick={toggleOrder}>
                          {o.status==="Issued"?"Revert":"Mark Issued"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ════════════ TAB 2 – Add Product ════════════ */}
      {tab===2 && (
        <div className="svc-add-form-card">
          <div className="svc-add-form-title"><i className="bx bxs-box"></i> Add New Product</div>
          <div className="svc-modal-grid">
            {[
              ["Product Name","name","text"],
              ["Stock Quantity","stock","number"],
            ].map(([lbl,name,type])=>(
              <div className="svc-field" key={name}>
                <label>{lbl}<span style={{color:"#ef4444",marginLeft:3}}>*</span></label>
                <input type={type} value={addForm[name]||""} onChange={e=>fa({[name]:e.target.value})} placeholder={`Enter ${lbl}`}/>
                {addErrors[name] && <span className="svc-err">{addErrors[name]}</span>}
              </div>
            ))}
            <div className="svc-field">
              <label>Class</label>
              <select value={classId ?? ""} onChange={(e) => setClassId(Number(e.target.value))}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="svc-field">
              <label>Section</label>
              <select value={sectionId ?? ""} onChange={(e) => setSectionId(Number(e.target.value))}>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {addErrors.class && <span className="svc-err">{addErrors.class}</span>}
            </div>
            <div className="svc-field">
              <label>Category</label>
              <select value={addForm.category} onChange={e=>fa({category:e.target.value})}>
                {["Stationery","Instrument","Art","Uniform"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="svc-modal-footer" style={{ marginTop:24 }}>
            <button className="svc-btn-cancel" onClick={()=>{ setAddForm(EMPTY_PRODUCT); setAddErrors({}); switchTab(0); }}>Cancel</button>
            <button className="svc-btn-save" onClick={submitAdd}><i className="bx bx-check"></i> Add Product</button>
          </div>
        </div>
      )}

      {/* ════════ View Modal ════════ */}
      {modal==="view" && (
        <div className="svc-overlay" onClick={()=>setModal(null)}>
          <div className="svc-modal" onClick={e=>e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span>Product Details</span>
              <button className="svc-modal-close" onClick={()=>setModal(null)}><i className="bx bx-x"></i></button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-view-grid">
                {[["Name",form.name],["Category",form.category],["Unit",form.unit],["Unit Price",`₹${form.unitPrice}`],["Stock",form.stock],["Reorder Level",form.reorder],["Supplier",form.supplier],["Status",form.status]].map(([k,v])=>(
                  <div className="svc-view-row" key={k}><span className="svc-view-key">{k}</span><span className="svc-view-val">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn-save" onClick={()=>setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Edit Modal ════════ */}
      {modal==="edit" && (
        <div className="svc-overlay" onClick={()=>setModal(null)}>
          <div className="svc-modal" onClick={e=>e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span>Edit Product</span>
              <button className="svc-modal-close" onClick={()=>setModal(null)}><i className="bx bx-x"></i></button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-modal-grid">
                {[["Product Name","name","text"],["Stock","stock","number"]].map(([lbl,name,type])=>(
                  <div className="svc-field" key={name}>
                    <label>{lbl}</label>
                    <input type={type} value={form[name]||""} onChange={e=>fc({[name]:e.target.value})} placeholder={lbl}/>
                  </div>
                ))}
                <div className="svc-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e=>fc({category:e.target.value})}>
                    {["Stationery","Instrument","Art","Uniform"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="svc-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e=>fc({status:e.target.value})}>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn-cancel" onClick={()=>setModal(null)}>Cancel</button>
              <button className="svc-btn-save" onClick={saveEdit}><i className="bx bx-check"></i> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Delete Confirm ════════ */}
      {deletingId && (
        <div className="svc-overlay" onClick={()=>setDeletingId(null)}>
          <div className="svc-modal svc-modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="svc-delete-body">
              <i className="bx bxs-error-circle svc-delete-icon"></i>
              <p>Are you sure you want to delete this product from inventory?</p>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn-cancel" onClick={()=>setDeletingId(null)}>Cancel</button>
              <button className="svc-btn-danger" onClick={()=>deleteProduct(deletingId)}><i className="bx bx-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
