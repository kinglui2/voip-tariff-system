import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash } from 'react-icons/fa';
import { DataGrid } from '@mui/x-data-grid';
import { useMediaQuery } from '@mui/material';

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratesLoading, setRatesLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, supplier: null });
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true);
      try {
        const res = await fetch('/api/suppliers');
        const data = await res.json();
        setSuppliers(data);
      } catch {
        setError('Failed to fetch suppliers');
      } finally {
        setLoading(false);
      }
    }
    fetchSuppliers();
  }, []);

  const handleSupplierClick = async (supplier) => {
    setSelectedSupplier(supplier);
    setRates([]);
    setRatesLoading(true);
    try {
      const res = await fetch(`/api/supplier-rates/supplier/${supplier.id}`);
      let data = await res.json();
      // Sort rates alphabetically by description (Destination)
      data = data.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
      setRates(data);
    } catch {
      setError('Failed to fetch rates');
    } finally {
      setRatesLoading(false);
    }
  };

  const openDeleteModal = (supplier, e) => {
    e.stopPropagation();
    setDeleteModal({ open: true, supplier });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, supplier: null });
  };

  const handleDeleteSupplier = async () => {
    const supplier = deleteModal.supplier;
    if (!supplier) return;
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, { method: 'DELETE' });
      if (res.ok) {
        closeDeleteModal();
        toast.success('Supplier deleted');
        setSuppliers(suppliers.filter(s => s.id !== supplier.id));
        if (selectedSupplier && selectedSupplier.id === supplier.id) {
          setSelectedSupplier(null);
          setRates([]);
        }
      } else {
        closeDeleteModal();
        const data = await res.json();
        toast.error(data.message || 'Failed to delete supplier');
      }
    } catch (err) {
      closeDeleteModal();
      toast.error('Failed to delete supplier: ' + err.message);
    }
  };

  return (
    <div style={{
      display: isMobile ? 'block' : 'flex',
      minHeight: '70vh',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Sidebar or Dropdown: Supplier List */}
      {isMobile ? (
        <div style={{ padding: '16px 16px 0 16px', background: 'var(--color-bg-sidebar)' }}>
          <label htmlFor="supplier-select" style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 6, display: 'block' }}>Suppliers</label>
          <select
            id="supplier-select"
            value={selectedSupplier ? selectedSupplier.id : ''}
            onChange={e => {
              const sup = suppliers.find(s => s.id === Number(e.target.value));
              if (sup) handleSupplierClick(sup);
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              fontSize: 16,
              background: 'var(--color-bg-main)',
              color: 'var(--color-text-main)',
              marginBottom: 12,
            }}
          >
            <option value="" disabled>Select a supplier</option>
            {suppliers.map(sup => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div style={{ width: 260, borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)', padding: 16, color: 'var(--color-text-main)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--color-text-main)' }}>Suppliers</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {suppliers.map((supplier) => (
                <li key={supplier.id} style={{ position: 'relative' }}>
                  <button
                    style={{
                      margin: '4px 0',
                      width: '100%',
                      padding: '8px 12px',
                      background: selectedSupplier && selectedSupplier.id === supplier.id ? 'var(--color-bg-sidebar-btn-active)' : 'var(--color-bg-sidebar-btn)',
                      border: selectedSupplier && selectedSupplier.id === supplier.id ? '2px solid var(--color-border-btn-active)' : '1px solid var(--color-border-btn)',
                      borderRadius: 4,
                      fontWeight: selectedSupplier && selectedSupplier.id === supplier.id ? 'bold' : 'normal',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--color-text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => handleSupplierClick(supplier)}
                  >
                    <span>{supplier.name}</span>
                    <span
                      onClick={(e) => openDeleteModal(supplier, e)}
                      style={{ marginLeft: 10, color: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Delete supplier"
                    >
                      <FaTrash size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Main: Rates Table */}
      <div style={{ flex: 1, padding: isMobile ? '16px' : 24, overflow: 'auto', width: '100%' }}>
        {selectedSupplier ? (
          <>
            <h3 style={{ marginTop: 0 }}>{isMobile ? '' : 'Rates for '}{selectedSupplier.name}</h3>
            {ratesLoading ? (
              <p>Loading rates...</p>
            ) : rates.length === 0 ? (
              <p>No rates found for this supplier.</p>
            ) : (
              <div style={{ height: isMobile ? 'auto' : '60vh', width: '100%', minWidth: 320 }}>
                <DataGrid
                  rows={rates.map((r, i) => ({ ...r, id: r.id || i }))}
                  columns={[
                    { field: 'description', headerName: 'Destination', flex: 1, minWidth: 140 },
                    { field: 'prefix', headerName: 'Numbering plan', flex: 1, minWidth: 120 },
                    { field: 'voice_rate', headerName: 'Rates per minute', flex: 1, minWidth: 120 },
                    { field: 'effective_date', headerName: 'Effective Date', flex: 1, minWidth: 120 },
                    { field: 'comments', headerName: 'Comments', flex: 1, minWidth: 120 },
                    { field: 'round_rules', headerName: 'Round Rules', flex: 1, minWidth: 120 },
                  ]}
                  pageSize={isMobile ? 5 : 20}
                  rowsPerPageOptions={isMobile ? [5, 10, 20] : [10, 20, 50, 100]}
                  disableSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-root': { background: '#fff' },
                    fontSize: 15,
                  }}
                  autoHeight={isMobile}
                />
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Select a supplier to view their rates.</p>
        )}
      </div>
      {/* Delete Supplier Modal */}
      {deleteModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: '2rem 2.5rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
          }}>
            <h3 style={{ margin: 0, marginBottom: 18, color: '#d32f2f' }}>Delete Supplier</h3>
            <p style={{ marginBottom: 24 }}>
              Are you sure you want to delete supplier <b>{deleteModal.supplier?.name}</b>?<br />
              <span style={{ color: '#d32f2f' }}>This will also delete all their rates.</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              <button
                onClick={handleDeleteSupplier}
                style={{
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(211,47,47,0.08)',
                }}
              >
                Delete
              </button>
              <button
                onClick={closeDeleteModal}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImportRates() {
  const [file, setFile] = useState(null);
  const [supplierName, setSupplierName] = useState('');
  const [imported, setImported] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setImported(0);
  };

  const handleSupplierNameChange = (e) => {
    setSupplierName(e.target.value);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setImported(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warn('Please select a CSV file.');
      return;
    }
    if (!supplierName.trim()) {
      toast.warn('Please enter a supplier name.');
      return;
    }
    toast.info('Uploading...');
    setImported(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supplier_name', supplierName.trim());
    try {
      const res = await fetch('/api/supplier-rates/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (data.imported > 0) {
          toast.success('Import successful! Imported: ' + data.imported + ' rates');
        } else {
          toast.warn('No valid rates were imported. Please check your CSV file.');
        }
        setImported(data.imported);
        if (data.errors && data.errors.length > 0) {
          toast.error('Some errors occurred during import.');
        }
      } else {
        toast.error(data.message || 'Import failed.');
      }
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh' }}>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-bg-nav)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          padding: '2.5rem 2rem',
          minWidth: 350,
          maxWidth: 400,
          marginTop: 40,
          width: '100%',
        }}
        autoComplete="off"
      >
        <h2 style={{ marginTop: 0, marginBottom: 24, color: 'var(--color-text-main)', textAlign: 'center' }}>Import Supplier Rates</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Supplier Name</label>
          <input
            type="text"
            value={supplierName}
            onChange={handleSupplierNameChange}
            placeholder="Enter supplier name"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              fontSize: 16,
              background: 'var(--color-bg-main)',
              color: 'var(--color-text-main)',
              marginBottom: 2,
            }}
          />
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: dragActive ? '2px dashed #409eff' : '2px dashed var(--color-border)',
            background: dragActive ? '#e6f0ff' : 'var(--color-bg-main)',
            borderRadius: 8,
            padding: '28px 0',
            textAlign: 'center',
            marginBottom: 18,
            transition: 'border 0.2s, background 0.2s',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
          }}
          onClick={() => document.getElementById('import-file-input').click()}
        >
          {file ? (
            <span style={{ color: 'var(--color-text-main)' }}>{file.name}</span>
          ) : (
            <span>Drag & drop CSV file here, or <span style={{ color: '#409eff', textDecoration: 'underline' }}>browse</span></span>
          )}
          <input
            id="import-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 6,
            background: '#409eff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            marginBottom: 10,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(64,158,255,0.08)',
            transition: 'background 0.2s',
          }}
        >
          Import
        </button>
        {imported > 0 && <p style={{ color: '#52c41a', textAlign: 'center' }}>Imported: {imported} rates</p>}
      </form>
    </div>
  );
}

function ExportRates() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    let toastId = toast.info('Exporting rates...', { autoClose: false });
    try {
      const res = await fetch('/api/consolidated-rates/export');
      if (!res.ok) {
        let msg = 'Export failed.';
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {}
        toast.update(toastId, { render: msg, type: toast.TYPE.ERROR, autoClose: 4000 });
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'consolidated_rates.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.update(toastId, { render: 'Export successful! Downloading CSV.', type: toast.TYPE.SUCCESS, autoClose: 4000 });
    } catch {
      toast.update(toastId, { render: 'Export failed. Please try again.', type: toast.TYPE.ERROR, autoClose: 4000 });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', justifyContent: 'center' }}>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div style={{ background: 'var(--color-bg-nav)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '2.5rem 2rem', minWidth: 350, maxWidth: 400, width: '100%' }}>
        <h2 style={{ marginTop: 0, marginBottom: 24, color: 'var(--color-text-main)', textAlign: 'center' }}>Export Consolidated Rates</h2>
        <button
          onClick={handleExport}
          disabled={downloading}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 6,
            background: '#409eff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            marginBottom: 10,
            cursor: downloading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(64,158,255,0.08)',
            transition: 'background 0.2s',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? 'Exporting...' : 'Download CSV'}
        </button>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 18, textAlign: 'center' }}>
          This will generate and download the latest consolidated rates as a CSV file, ready for VoipSwitch import.
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    supplierCount: null,
    rateCount: null,
    lastImport: null,
    cheapest: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [suppliersRes, ratesRes, lastImportRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/supplier-rates'),
          fetch('/api/supplier-rates'),
        ]);
        const suppliers = await suppliersRes.json();
        const rates = await ratesRes.json();
        const allRates = await lastImportRes.json();
        let lastImport = null;
        if (allRates.length > 0) {
          lastImport = allRates.reduce((max, r) => r.created_at > max ? r.created_at : max, allRates[0].created_at);
        }
        let cheapest = null;
        if (allRates.length > 0) {
          const minRate = Math.min(...allRates.map(r => parseFloat(r.voice_rate)));
          const cheapestRate = allRates.find(r => parseFloat(r.voice_rate) === minRate);
          const supplier = suppliers.find(s => s.id === cheapestRate.supplier_id);
          cheapest = supplier ? { name: supplier.name, rate: minRate } : null;
        }
        setStats({
          supplierCount: suppliers.length,
          rateCount: rates.length,
          lastImport,
          cheapest,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Helper for short date
  function formatShortDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1rem' }}>
      <div className="dashboard-cards-row">
        {[{
          icon: '👥',
          value: loading ? '...' : stats.supplierCount,
          label: 'Suppliers',
        }, {
          icon: '📊',
          value: loading ? '...' : stats.rateCount,
          label: 'Rates',
        }, {
          icon: '⏰',
          value: loading ? '...' : (stats.lastImport ? formatShortDate(stats.lastImport) : 'N/A'),
          label: 'Last Import',
        }, {
          icon: '💸',
          value: loading ? '...' : (stats.cheapest ? `${stats.cheapest.name} (${stats.cheapest.rate})` : 'N/A'),
          label: 'Cheapest Provider',
        }].map((card, i) => (
          <div key={i} className="dashboard-card">
            <span className="dashboard-card-icon">{card.icon}</span>
            <div className="dashboard-card-content">
              <div className="dashboard-card-label">{card.label}</div>
              <div className="dashboard-card-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-actions-row">
        <button className="dashboard-action-btn" onClick={() => window.location.href = '/suppliers'}>
          <span style={{ verticalAlign: 'middle', marginRight: 8 }}>👥</span> Manage Suppliers
        </button>
        <button className="dashboard-action-btn" onClick={() => window.location.href = '/import'}>
          <span style={{ verticalAlign: 'middle', marginRight: 8 }}>⬆️</span> Import Rates
        </button>
        <button className="dashboard-action-btn" onClick={() => window.location.href = '/export'}>
          <span style={{ verticalAlign: 'middle', marginRight: 8 }}>⬇️</span> Export Rates
        </button>
      </div>
    </div>
  );
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    const close = () => setMobileNavOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-logo">VoIP Tariff System</div>
        <button
          className={`navbar-hamburger${mobileNavOpen ? ' active' : ''}`}
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <div className={`navbar-links ${mobileNavOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMobileNavOpen(false)}>Dashboard</Link>
          <Link to="/suppliers" onClick={() => setMobileNavOpen(false)}>Suppliers</Link>
          <Link to="/import" onClick={() => setMobileNavOpen(false)}>Import Rates</Link>
          <Link to="/export" onClick={() => setMobileNavOpen(false)}>Export</Link>
        </div>
        {mobileNavOpen && <div className="navbar-backdrop" onClick={() => setMobileNavOpen(false)} />}
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/import" element={<ImportRates />} />
        <Route path="/export" element={<ExportRates />} />
        <Route path="*" element={<h1>Welcome to the VoIP Tariff System</h1>} />
      </Routes>
    </>
  );
}

export default App;
