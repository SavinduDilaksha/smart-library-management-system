'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, BookOpen, Loader2 } from 'lucide-react';
import { BOOK_CATEGORIES } from '@/constants';

interface Book {
  id: string; title: string; author: string; isbn: string;
  category: string; publisher: string | null; quantity: number; available: number;
  description: string | null; coverImage: string | null;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', category: '', publisher: '',
    quantity: 1, description: '', coverImage: ''
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/books?${params}`);
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, categoryFilter]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const openCreate = () => {
    setEditBook(null);
    setForm({
      title: '', author: '', isbn: '', category: '', publisher: '',
      quantity: 5, description: '', coverImage: ''
    });
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      category: book.category, publisher: book.publisher || '', quantity: book.quantity,
      description: book.description || '', coverImage: book.coverImage || ''
    });
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image is too large. Please select an image smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editBook && Number(form.quantity) < 5) {
      alert('A new book must have at least 5 copies.');
      return;
    }
    setSaving(true);
    try {
      const url = editBook ? `/api/books/${editBook.id}` : '/api/books';
      const method = editBook ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchBooks(); }
      else alert(json.error || 'Failed to save');
    } catch { alert('Error saving book'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchBooks();
      else alert(json.error);
    } catch { alert('Error deleting book'); }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Book Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {books.length} books in the library catalog
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Add Book
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {/* Filters */}
        <div className="table-header">
          <div className="search-bar-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="input"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select" style={{ width: 'auto', minWidth: 160 }}>
            <option value="">All Categories</option>
            {BOOK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><BookOpen size={22} /></div>
                      <h3>No books found</h3>
                      <p>Add your first book to the catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : books.map(book => (
                <tr key={book.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{book.title}</span>
                  </td>
                  <td className="td-secondary">{book.author}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{book.isbn}</span>
                  </td>
                  <td><span className="badge badge-indigo">{book.category}</span></td>
                  <td className="td-secondary">{book.quantity}</td>
                  <td>
                    <span className={`badge ${book.available > 0 ? 'badge-green' : 'badge-red'}`}>
                      {book.available}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => openEdit(book)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent)' }}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book title" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input className="input" value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Author name" />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN *</label>
                  <input className="input" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} placeholder="978-..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select category</option>
                    {BOOK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="input" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})} min={editBook ? 1 : 5} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Publisher</label>
                  <input className="input" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} placeholder="Publisher name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  {form.coverImage ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', background: '#F9FAFB', position: 'relative' }}>
                        <img src={form.coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, coverImage: '' })}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="input"
                      style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter a brief description of the book..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.author || !form.isbn || !form.category}
                className="btn btn-primary"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : editBook ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
