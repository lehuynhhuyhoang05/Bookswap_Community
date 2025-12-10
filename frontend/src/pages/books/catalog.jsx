// src/pages/books/catalog.jsx
/**
 * Book Catalog Page - "Kho Sách"
 * Pre-loaded books from Google Books API for quick adding
 * User can browse, search and add to library/wanted list with one click
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge } from '../../components/ui';
import { useLibrary } from '../../hooks/useLibrary';
import { 
  Search, BookOpen, Heart, Library, Plus, Check, X,
  Filter, Grid, List, RefreshCw, Sparkles, ExternalLink,
  BookMarked, Flame, Star, Clock, Globe, User, Calendar, FileText
} from 'lucide-react';

// Categories to pre-load books from - MORE categories for more books
const CATEGORIES = [
  { key: 'trending', label: '🔥 Trending', query: 'bestseller 2024', icon: Flame },
  { key: 'trending2', label: '🔥 Hot 2023', query: 'best books 2023', icon: Flame },
  { key: 'fiction', label: '📖 Tiểu thuyết', query: 'fiction novel', icon: BookOpen },
  { key: 'fiction_vn', label: '📖 Văn học VN', query: 'vietnamese literature novel', icon: BookOpen },
  { key: 'classic', label: '📚 Kinh điển', query: 'classic literature masterpiece', icon: BookOpen },
  { key: 'selfhelp', label: '💡 Self-Help', query: 'self help motivation success', icon: Star },
  { key: 'selfhelp2', label: '💡 Phát triển bản thân', query: 'personal development habits', icon: Star },
  { key: 'business', label: '💼 Kinh doanh', query: 'business entrepreneurship startup', icon: BookMarked },
  { key: 'finance', label: '💰 Tài chính', query: 'finance investment money', icon: BookMarked },
  { key: 'marketing', label: '📈 Marketing', query: 'marketing sales digital', icon: BookMarked },
  { key: 'science', label: '🔬 Khoa học', query: 'science physics chemistry', icon: Globe },
  { key: 'tech', label: '💻 Công nghệ', query: 'technology programming software', icon: Globe },
  { key: 'ai', label: '🤖 AI & Data', query: 'artificial intelligence machine learning', icon: Globe },
  { key: 'manga', label: '🎌 Manga', query: 'manga japanese comic', icon: Sparkles },
  { key: 'manga2', label: '🎌 Anime', query: 'anime light novel japanese', icon: Sparkles },
  { key: 'comic', label: '🦸 Comics', query: 'comic superhero marvel dc', icon: Sparkles },
  { key: 'history', label: '📜 Lịch sử', query: 'history world war civilization', icon: Clock },
  { key: 'history_vn', label: '📜 Lịch sử VN', query: 'vietnam history war', icon: Clock },
  { key: 'philosophy', label: '🧠 Triết học', query: 'philosophy thinking wisdom', icon: Clock },
  { key: 'psychology', label: '🧠 Tâm lý học', query: 'psychology behavior mind', icon: Clock },
  { key: 'children', label: '🧒 Thiếu nhi', query: 'children books kids story', icon: Heart },
  { key: 'young_adult', label: '🧒 Tuổi teen', query: 'young adult teen fiction', icon: Heart },
  { key: 'romance', label: '💕 Lãng mạn', query: 'romance love story novel', icon: Heart },
  { key: 'mystery', label: '🔍 Trinh thám', query: 'mystery detective thriller', icon: BookOpen },
  { key: 'horror', label: '👻 Kinh dị', query: 'horror scary supernatural', icon: BookOpen },
  { key: 'fantasy', label: '🧙 Fantasy', query: 'fantasy magic wizard dragon', icon: Sparkles },
  { key: 'scifi', label: '🚀 Sci-Fi', query: 'science fiction space future', icon: Sparkles },
  { key: 'cooking', label: '🍳 Nấu ăn', query: 'cooking recipe food chef', icon: BookMarked },
  { key: 'health', label: '🏃 Sức khỏe', query: 'health fitness wellness exercise', icon: Star },
  { key: 'travel', label: '✈️ Du lịch', query: 'travel guide adventure explore', icon: Globe },
  { key: 'art', label: '🎨 Nghệ thuật', query: 'art design creative drawing', icon: Sparkles },
  { key: 'music', label: '🎵 Âm nhạc', query: 'music biography musician', icon: Sparkles },
  { key: 'biography', label: '👤 Tiểu sử', query: 'biography autobiography memoir', icon: Clock },
  { key: 'leadership', label: '👔 Lãnh đạo', query: 'leadership management team', icon: BookMarked },
  { key: 'education', label: '🎓 Giáo dục', query: 'education learning teaching study', icon: Star },
  { key: 'language', label: '🌍 Ngôn ngữ', query: 'language learning english vietnamese', icon: Globe },
];

const BookCatalogPage = () => {
  const navigate = useNavigate();
  const { addWantedBook } = useLibrary();

  // State
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [addingBook, setAddingBook] = useState(null);
  const [addedToLibrary, setAddedToLibrary] = useState(new Set());
  const [addedToWanted, setAddedToWanted] = useState(new Set());
  const [selectedBook, setSelectedBook] = useState(null); // For modal
  const [searchInput, setSearchInput] = useState(''); // User input in search bar
  const [searching, setSearching] = useState(false); // Loading state for search
  const [searchResults, setSearchResults] = useState([]); // Results from Google Books search

  // Fetch books from Google Books API via backend (with Redis cache) - 40 per category
  const fetchBooksFromCategory = async (category) => {
    try {
      const response = await fetch(
        `http://localhost:3000/books/search/google?query=${encodeURIComponent(category.query)}&maxResults=40`
      );
      const data = await response.json();
      
      // Backend returns GoogleBookResult[] directly (not wrapped in 'items')
      const items = Array.isArray(data) ? data : (data.value || []);
      
      if (items && items.length > 0) {
        return items.map(item => ({
          id: item.id,
          google_books_id: item.id,
          title: item.title || 'Unknown',
          author: item.authors?.join(', ') || 'Unknown',
          isbn: item.isbn || '',
          cover_image_url: item.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
          category: category.label,
          categoryKey: category.key,
          language: item.language || '',
          publisher: item.publisher || '',
          publishedDate: item.publishedDate || '',
          description: item.description?.substring(0, 200) || '',
          pageCount: item.pageCount || 0,
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${category.key}:`, error);
      return [];
    }
  };

  // Load all books on mount - parallel loading with batches
  useEffect(() => {
    const loadAllBooks = async () => {
      setLoading(true);
      const seen = new Set();
      const allLoadedBooks = [];
      
      // Load in batches of 6 to avoid rate limiting
      const batchSize = 6;
      for (let i = 0; i < CATEGORIES.length; i += batchSize) {
        const batch = CATEGORIES.slice(i, i + batchSize);
        try {
          const results = await Promise.all(
            batch.map(cat => fetchBooksFromCategory(cat))
          );
          
          // Add new books, dedupe
          results.flat().forEach(book => {
            if (!seen.has(book.google_books_id)) {
              seen.add(book.google_books_id);
              allLoadedBooks.push(book);
            }
          });
          
          // Update state progressively so user sees books loading
          setAllBooks([...allLoadedBooks]);
        } catch (error) {
          console.error('Batch load error:', error);
        }
      }
      
      setLoading(false);
    };

    loadAllBooks();
  }, []);

  // Search books from Google Books API via backend (with Redis cache)
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `http://localhost:3000/books/search/google?query=${encodeURIComponent(searchInput)}&maxResults=40`
      );
      const data = await response.json();
      
      // Backend returns GoogleBookResult[] directly (not wrapped in 'items')
      const items = Array.isArray(data) ? data : (data.value || []);
      
      if (items && items.length > 0) {
        const books = items.map(item => ({
          id: item.id,
          google_books_id: item.id,
          title: item.title || 'Unknown',
          author: item.authors?.join(', ') || 'Unknown',
          isbn: item.isbn || '',
          cover_image_url: item.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
          category: '🔍 Kết quả tìm kiếm',
          categoryKey: 'search',
          language: item.language || '',
          publisher: item.publisher || '',
          publishedDate: item.publishedDate || '',
          description: item.description?.substring(0, 200) || '',
          pageCount: item.pageCount || 0,
        }));
        setSearchResults(books);
        setSelectedCategory('all'); // Reset category filter when searching
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Lỗi khi tìm kiếm. Vui lòng thử lại.');
    }
    setSearching(false);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchResults([]);
  };

  // Filter books based on search and category
  const filteredBooks = useMemo(() => {
    // If user has searched, show search results instead of catalog
    if (searchResults.length > 0) {
      return searchResults;
    }

    let result = allBooks;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.categoryKey === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn?.includes(query)
      );
    }

    return result;
  }, [allBooks, selectedCategory, searchQuery, searchResults]);

  // Add to my library (navigate to add-book with prefill)
  const handleAddToLibrary = (book) => {
    // Clean category - remove emojis
    const cleanCategory = book.category?.replace(/[🔥📖💡💼🔬🎌📜🧒🧠💕🔍👻🧙🚀🍳🏃✈️🎨🎵👤👔🎓🌍🦸💰📈🤖]/g, '').trim() || 'General';
    
    const prefillData = {
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      google_books_id: book.google_books_id || '',
      cover_image_url: book.cover_image_url || '',
      category: cleanCategory,
      language: book.language || 'vi',
      publisher: book.publisher || '',
      publish_date: book.publishedDate || '',
      description: book.description || '',
      page_count: book.pageCount || '',
    };
    
    console.log('📚 Prefill data for add-book:', prefillData);
    sessionStorage.setItem('prefill_book_data', JSON.stringify(prefillData));
    setAddedToLibrary(prev => new Set([...prev, book.id]));
    navigate('/books/add-book');
  };

  // Add to wanted list
  const handleAddToWanted = async (book) => {
    setAddingBook(book.id);
    try {
      await addWantedBook({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        google_books_id: book.google_books_id,
        cover_image_url: book.cover_image_url,
        category: book.category?.replace(/[🔥📖💡💼🔬🎌📜🧒]/g, '').trim() || 'General',
        language: book.language,
        preferred_condition: 'ANY',
        priority: 5,
      });
      setAddedToWanted(prev => new Set([...prev, book.id]));
    } catch (error) {
      console.error('Failed to add to wanted:', error);
      // Check if already exists
      if (error.message?.includes('already') || error.message?.includes('exists')) {
        setAddedToWanted(prev => new Set([...prev, book.id]));
      } else {
        alert('Lỗi: ' + (error.message || 'Không thể thêm sách'));
      }
    }
    setAddingBook(null);
  };

  // Refresh books
  const handleRefresh = async () => {
    setLoading(true);
    setAllBooks([]);
    try {
      const results = await Promise.all(
        CATEGORIES.map(cat => fetchBooksFromCategory(cat))
      );
      const seen = new Set();
      const books = results.flat().filter(book => {
        if (seen.has(book.google_books_id)) return false;
        seen.add(book.google_books_id);
        return true;
      });
      setAllBooks(books);
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
    setLoading(false);
  };

  // Book Card Component - Clean design, click to view details
  const BookCard = ({ book }) => {
    const isAddedToWanted = addedToWanted.has(book.id);
    const isAddedToLibrary = addedToLibrary.has(book.id);

    if (viewMode === 'list') {
      return (
        <div 
          onClick={() => setSelectedBook(book)}
          className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
        >
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} className="w-16 h-24 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow" />
          ) : (
            <div className="w-16 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{book.title}</h3>
            <p className="text-sm text-gray-500 truncate">{book.author}</p>
            <div className="flex items-center gap-2 mt-2">
              {book.language && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {book.language === 'vi' ? '🇻🇳 Tiếng Việt' : book.language === 'en' ? '🇬🇧 English' : book.language}
                </span>
              )}
              {(isAddedToLibrary || isAddedToWanted) && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Đã thêm
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
            <ExternalLink className="w-5 h-5" />
          </div>
        </div>
      );
    }

    // Grid view - Clean card
    return (
      <div 
        onClick={() => setSelectedBook(book)}
        className="bg-white rounded-xl overflow-hidden border hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {book.cover_image_url ? (
            <img 
              src={book.cover_image_url} 
              alt={book.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-indigo-300" />
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
              Xem chi tiết
            </span>
          </div>
          {/* Status badges */}
          {(isAddedToLibrary || isAddedToWanted) && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Đã thêm
              </span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
        </div>
      </div>
    );
  };

  // Book Detail Modal
  const BookDetailModal = ({ book, onClose }) => {
    if (!book) return null;
    
    const isAddingThis = addingBook === book.id;
    const isAddedToWanted = addedToWanted.has(book.id);
    const isAddedToLibrary = addedToLibrary.has(book.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Book Cover */}
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
              {book.cover_image_url ? (
                <img 
                  src={book.cover_image_url} 
                  alt={book.title} 
                  className="w-full max-w-[200px] rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-full max-w-[200px] aspect-[3/4] bg-white/50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-indigo-300" />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="md:w-2/3 p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                {/* Title & Author */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{book.title}</h2>
                  <p className="text-lg text-gray-600 mt-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {book.author}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-2">
                  {book.language && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                      <Globe className="w-4 h-4" />
                      {book.language === 'vi' ? 'Tiếng Việt' : book.language === 'en' ? 'English' : book.language.toUpperCase()}
                    </span>
                  )}
                  {book.isbn ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                      <FileText className="w-4 h-4" />
                      ISBN: {book.isbn}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm">
                      <FileText className="w-4 h-4" />
                      Không có ISBN
                    </span>
                  )}
                  {book.pageCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <BookOpen className="w-4 h-4" />
                      {book.pageCount} trang
                    </span>
                  )}
                  {book.publishedDate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm">
                      <Calendar className="w-4 h-4" />
                      {book.publishedDate}
                    </span>
                  )}
                </div>

                {/* Publisher */}
                {book.publisher && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Nhà xuất bản:</span> {book.publisher}
                  </p>
                )}

                {/* Description */}
                {book.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Mô tả</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Danh mục:</span>
                  <Badge variant="primary">{book.category}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium text-gray-900">Thêm vào bộ sưu tập của bạn</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAddToLibrary(book)}
                      disabled={isAddedToLibrary}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        isAddedToLibrary 
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {isAddedToLibrary ? (
                        <>
                          <Check className="w-5 h-5" />
                          Đã có trong thư viện
                        </>
                      ) : (
                        <>
                          <Library className="w-5 h-5" />
                          Tôi có sách này
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAddToWanted(book)}
                      disabled={isAddingThis || isAddedToWanted}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        isAddedToWanted 
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {isAddedToWanted ? (
                        <>
                          <Check className="w-5 h-5" />
                          Đã thêm vào mong muốn
                        </>
                      ) : isAddingThis ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          Tôi muốn sách này
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    💡 Thêm sách vào thư viện để người khác tìm thấy, hoặc thêm vào danh sách mong muốn để hệ thống gợi ý trao đổi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Book Detail Modal */}
        {selectedBook && (
          <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  Kho Sách
                </h1>
                <p className="text-indigo-100 mt-2">
                  Duyệt {allBooks.length} cuốn sách • Thêm nhanh vào thư viện hoặc danh sách mong muốn
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>

            {/* Search Bar - Google Books API */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm sách trên Google Books - nhập tên, tác giả, ISBN..."
                  className="w-full pl-12 pr-32 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={searching || !searchInput.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {searching ? 'Đang tìm...' : 'Tìm'}
                  </button>
                </div>
              </div>
              {searchResults.length > 0 && (
                <p className="mt-2 text-indigo-100 text-sm">
                  Tìm thấy {searchResults.length} kết quả từ Google Books
                </p>
              )}
            </form>

            {/* Quick filter (below search) */}
            <div className="mt-4 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh trong kết quả hiện tại..."
                className="w-full pl-11 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-400 bg-white/10 border border-white/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search Results Info */}
          {searchResults.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">
                    Kết quả tìm kiếm: "{searchInput}" - {searchResults.length} cuốn sách
                  </span>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Xóa tìm kiếm
                </button>
              </div>
            </div>
          )}

          {/* Filters & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Category Tabs - Hide when showing search results */}
            {searchResults.length === 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  Tất cả ({allBooks.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = allBooks.filter(b => b.categoryKey === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border'
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Toggle */}
            <div className="flex gap-1 bg-white rounded-lg p-1 border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-gray-500 mb-4">
              Tìm thấy <strong>{filteredBooks.length}</strong> sách cho "{searchQuery}"
            </p>
          )}

          {/* Books Grid/List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-4">Đang tải sách từ kho...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy sách nào</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-3'
            }>
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4">📊 Thống kê phiên này</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">{addedToLibrary.size}</div>
                <div className="text-sm text-gray-500">Thêm vào thư viện</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">{addedToWanted.size}</div>
                <div className="text-sm text-gray-500">Thêm vào mong muốn</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{allBooks.length}</div>
                <div className="text-sm text-gray-500">Tổng sách trong kho</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookCatalogPage;
