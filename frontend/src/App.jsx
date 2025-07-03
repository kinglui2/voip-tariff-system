import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratesLoading, setRatesLoading] = useState(false);

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
      const data = await res.json();
      setRates(data);
    } catch {
      setError('Failed to fetch rates');
    } finally {
      setRatesLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '70vh', border: '1px solid var(--color-border)', borderRadius: 8 }}>
      {/* Sidebar: Supplier List */}
      <div style={{ width: 260, borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)', padding: 16, color: 'var(--color-text-main)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--color-text-main)' }}>Suppliers</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {suppliers.map((supplier) => (
              <li key={supplier.id}>
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
                  }}
                  onClick={() => handleSupplierClick(supplier)}
                >
                  {supplier.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Main: Rates Table */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        {selectedSupplier ? (
          <>
            <h3 style={{ marginTop: 0 }}>Rates for {selectedSupplier.name}</h3>
            {ratesLoading ? (
              <p>Loading rates...</p>
            ) : rates.length === 0 ? (
              <p>No rates found for this supplier.</p>
            ) : (
              <div className="rates-table-container" style={{ maxHeight: '60vh', overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 6 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-table-header)', zIndex: 1 }}>
                    <tr>
                      <th>ID</th>
                      <th>Prefix</th>
                      <th>Description</th>
                      <th>Country</th>
                      <th>Voice Rate</th>
                      <th>Grace Period</th>
                      <th>Minimal Time</th>
                      <th>Resolution</th>
                      <th>Rate Multiplier</th>
                      <th>Rate Addition</th>
                      <th>Surcharge Time</th>
                      <th>Surcharge Amount</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate) => (
                      <tr key={rate.id}>
                        <td>{rate.id}</td>
                        <td>{rate.prefix}</td>
                        <td>{rate.description}</td>
                        <td>{rate.country}</td>
                        <td>{rate.voice_rate}</td>
                        <td>{rate.grace_period}</td>
                        <td>{rate.minimal_time}</td>
                        <td>{rate.resolution}</td>
                        <td>{rate.rate_multiplier}</td>
                        <td>{rate.rate_addition}</td>
                        <td>{rate.surcharge_time}</td>
                        <td>{rate.surcharge_amount}</td>
                        <td>{rate.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Select a supplier to view their rates.</p>
        )}
      </div>
    </div>
  );
}

function ImportRates() {
  const [file, setFile] = useState(null);
  const [supplierName, setSupplierName] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [imported, setImported] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
    setErrors([]);
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
      setStatus('');
      setErrors([]);
      setImported(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a CSV file.');
      return;
    }
    if (!supplierName.trim()) {
      setStatus('Please enter a supplier name.');
      return;
    }
    setStatus('Uploading...');
    setErrors([]);
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
        setStatus('Import successful!');
        setImported(data.imported);
        setErrors(data.errors || []);
      } else {
        setStatus('Import failed.');
        setErrors([data.message || 'Unknown error']);
      }
    } catch (err) {
      setStatus('Import failed.');
      setErrors([err.message]);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh' }}>
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
        {status && <p style={{ color: status.includes('success') ? '#52c41a' : '#d32f2f', margin: '10px 0 0 0', textAlign: 'center' }}>{status}</p>}
        {imported > 0 && <p style={{ color: '#52c41a', textAlign: 'center' }}>Imported: {imported} rates</p>}
        {errors.length > 0 && (
          <div style={{ color: '#d32f2f', marginTop: 10 }}>
            <h4 style={{ margin: '10px 0 4px 0', fontSize: 15 }}>Errors:</h4>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14 }}>
              {errors.map((err, i) => (
                <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}

function ExportRates() {
  return <h2>Export Consolidated Rates (Coming Soon)</h2>;
}

function App() {
  return (
    <>
      <nav style={{
        width: '100%',
        background: 'linear-gradient(90deg, #409eff 0%, #66b1ff 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.5rem 1rem',
        marginBottom: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(64,158,255,0.07)',
        flexWrap: 'wrap',
        minHeight: 56,
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: 1, flexShrink: 0 }}>
          VoIP Tariff System
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
          <Link to="/suppliers" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 16, padding: '6px 0', borderBottom: '2px solid transparent', transition: 'border 0.2s' }}>Suppliers</Link>
          <Link to="/import" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 16, padding: '6px 0', borderBottom: '2px solid transparent', transition: 'border 0.2s' }}>Import Rates</Link>
          <Link to="/export" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 16, padding: '6px 0', borderBottom: '2px solid transparent', transition: 'border 0.2s' }}>Export</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/import" element={<ImportRates />} />
        <Route path="/export" element={<ExportRates />} />
        <Route path="*" element={<h1>Welcome to the VoIP Tariff System</h1>} />
      </Routes>
    </>
  );
}

export default App;
