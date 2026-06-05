'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { BOOK_CATEGORIES } from '@/constants';

interface Book {
  id: string; title: string; author: string; isbn: string;
  category: string; publisher: string | null; quantity: number; available: number;
  description?: string | null; coverImage?: string | null;
  activeRequestsCount?: number;
}

// Book cover colors based on category
const COVER_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  'Fiction':     { bg: '#EEF2FF', text: '#4F46E5', emoji: '📖' },
  'Science':     { bg: '#ECFDF5', text: '#059669', emoji: '🔬' },
  'History':     { bg: '#FEF3C7', text: '#D97706', emoji: '🏛️' },
  'Technology':  { bg: '#E0F2FE', text: '#0284C7', emoji: '💻' },
  'Literature':  { bg: '#FDF2F8', text: '#9D174D', emoji: '✍️' },
  'Philosophy':  { bg: '#F5F3FF', text: '#6D28D9', emoji: '🤔' },
  'Biology':     { bg: '#F0FDF4', text: '#166534', emoji: '🧬' },
  'Mathematics': { bg: '#FFF7ED', text: '#C2410C', emoji: '📐' },
  'default':     { bg: '#F8F9FC', text: '#4B5563', emoji: '📚' },
};

function getCoverStyle(category: string) {
  return COVER_COLORS[category] || COVER_COLORS['default'];
}

export default function UserCatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [maxOnlineCopiesPerBook, setMaxOnlineCopiesPerBook] = useState(3);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    try {
      const res = await fetch(`/api/books?${params}`);
      const json = await res.json();
      if (json.success) {
        setBooks(json.data);
        if (json.settings?.maxOnlineCopiesPerBook) {
          setMaxOnlineCopiesPerBook(json.settings.maxOnlineCopiesPerBook);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, category]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>Book Catalog</h1>
        <p>Browse and discover books from our library collection</p>
      </div>

      {/* Search + Filters */}
      <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search */}
          <div className="search-bar-wrapper" style={{ maxWidth: '100%', flex: 1, minWidth: 200 }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="input"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="select" style={{ width: 'auto', minWidth: 150 }}>
                <option value="">All Categories</option>
                {BOOK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* View toggle */}
            <div className="tabs" style={{ padding: '0.1875rem', gap: '0.125rem' }}>
              <button className={`tab-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
                ⊞ Grid
              </button>
              <button className={`tab-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>
                ☰ List
              </button>
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <div style={{ padding: '0.5rem 1.5rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {books.length} {books.length === 1 ? 'book' : 'books'} found
            {category && <> in <strong style={{ color: 'var(--text-secondary)' }}>{category}</strong></>}
            {search && <> matching &quot;<strong style={{ color: 'var(--text-secondary)' }}>{search}</strong>&quot;</>}
          </div>
        )}
      </div>

      {/* Books Grid / List */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="bookshelf-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bookshelf-book">
                <div className="skeleton book-spine-cover" style={{ borderRadius: '4px 12px 12px 4px' }} />
                <div className="skeleton" style={{ height: '14px', width: '80%', marginTop: '0.75rem', borderRadius: '4px' }} />
                <div className="skeleton" style={{ height: '12px', width: '50%', marginTop: '0.25rem', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        )
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BookOpen size={24} /></div>
          <h3>No books found</h3>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
          <button onClick={() => { setSearch(''); setCategory(''); }} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="bookshelf-grid">
          {books.map((book, i) => {
            const cover = getCoverStyle(book.category);
            const isOnlineAvailable = book.available > 0 && (book.activeRequestsCount ?? 0) < maxOnlineCopiesPerBook;
            return (
              <Link
                key={book.id}
                href={`/user/books/${book.id}`}
                className="bookshelf-book animate-fade-in"
                style={{ animationDelay: `${i * 0.025}s` }}
              >
                {/* 3D Cover */}
                <div className="book-spine-cover">
                  {book.coverImage ? (
                    <>
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="book-spine-effect" />
                    </>
                  ) : (
                    <div 
                      className="book-fallback-cover" 
                      style={{ 
                        backgroundColor: cover.bg, 
                        color: cover.text 
                      }}
                    >
                      <span className="book-fallback-category">{book.category}</span>
                      <div className="book-fallback-middle">
                        <span className="book-fallback-emoji">{cover.emoji}</span>
                        <span className="book-fallback-title">{book.title}</span>
                      </div>
                      <span className="book-fallback-author">{book.author}</span>
                      <div className="book-spine-effect" />
                    </div>
                  )}

                  {/* Floating Available/Unavailable badge */}
                  <span className={`badge ${isOnlineAvailable ? 'badge-green' : 'badge-red'} book-status-badge`}>
                    {isOnlineAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Typography details below the book cover */}
                <div className="book-title-sub">{book.title}</div>
                <div className="book-author-sub">{book.author}</div>
                <div className="book-copies-sub">
                  {book.available} / {book.quantity} copies
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        // List view
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>ISBN</th>
                  <th>Available</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => {
                  const cover = getCoverStyle(book.category);
                  const isOnlineAvailable = book.available > 0 && (book.activeRequestsCount ?? 0) < maxOnlineCopiesPerBook;
                  return (
                    <tr key={book.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.02}s` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: cover.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                                {cover.emoji}
                              </div>
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{book.title}</span>
                        </div>
                      </td>
                      <td className="td-secondary">{book.author}</td>
                      <td><span className="badge badge-indigo">{book.category}</span></td>
                      <td className="td-secondary" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{book.isbn}</td>
                      <td>
                        <span className={`badge ${isOnlineAvailable ? 'badge-green' : 'badge-red'}`}>
                          {isOnlineAvailable ? 'Available' : 'Unavailable'} ({book.available}/{book.quantity})
                        </span>
                      </td>
                      <td>
                        <Link href={`/user/books/${book.id}`} className="btn btn-secondary btn-sm">
                          <Eye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
