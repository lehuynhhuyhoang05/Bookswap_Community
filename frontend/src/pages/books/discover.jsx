// src/pages/books/discover.jsx
/**
 * Book Discovery Page
 * Search books from Google Books API and:
 * - Add to your library (books you have)
 * - Add to wanted list (books you want)
 * - See if anyone in the community has it
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Input } from '../../components/ui';
import { useBooks } from '../../hooks/useBooks';
import { useLibrary } from '../../hooks/useLibrary';
import { 
  Search, BookOpen, Heart, Plus, Library, Users, 
  Globe, Calendar, Building, ArrowRight, Check,
  Sparkles, TrendingUp
} from 'lucide-react';
import debounce from 'lodash/debounce';

const BookDiscoveryPage = () => {
  const navigate = useNavigate();
  const { searchBooks } = useBooks();
  const { addWantedBook } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [communityResults, setCommunityResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'google', 'community'
  const [addingBook, setAddingBook] = useState(null); // book being added
  const [addedBooks, setAddedBooks] = useState(new Set()); // track added books

  // Search Google Books
  const searchGoogleBooks = async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=vi,en`
      );
      const data = await response.json();
      
      if (data.items) {
        return data.items.map(item => ({
          id: item.id,
          google_books_id: item.id,
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(', ') || 'Unknown',
          isbn: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
          cover_image_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
          category: item.volumeInfo.categories?.[0] || '',
          language: item.volumeInfo.language || '',
          publisher: item.volumeInfo.publisher || '',
          publishedDate: item.volumeInfo.publishedDate || '',
          description: item.volumeInfo.description || '',
          pageCount: item.volumeInfo.pageCount || 0,
          source: 'google',
        }));
      }
      return [];
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    }
  };

  // Combined search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Search both Google Books and community
      const [googleData, communityData] = await Promise.all([
        searchGoogleBooks(searchQuery),
        searchBooks(searchQuery).then(res => res.data || []).catch(() => [])
      ]);

      setGoogleResults(googleData);
      setCommunityResults(communityData.map(book => ({ ...book, source: 'community' })));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for auto-complete feel
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length >= 3) {
        handleSearch();
      }
    }, 500),
    [searchQuery]
  );

  // Add to my library
  const handleAddToLibrary = (book) => {
    // Navigate to add-book page with pre-filled data
    sessionStorage.setItem('prefill_book_data', JSON.stringify({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      google_books_id: book.google_books_id,
      cover_image_url: book.cover_image_url,
      category: book.category,
      language: book.language,
    }));
    navigate('/books/add');
  };

  // Add to wanted list
  const handleAddToWanted = async (book) => {
    setAddingBook(book.id || book.google_books_id);
    try {
      await addWantedBook({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        google_books_id: book.google_books_id,
        cover_image_url: book.cover_image_url,
        category: book.category || 'General',
        language: book.language,
        preferred_condition: 'ANY',
        priority: 5,
      });
      setAddedBooks(prev => new Set([...prev, book.id || book.google_books_id]));
    } catch (error) {
      console.error('Failed to add to wanted:', error);
      alert('Không thể thêm: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setAddingBook(null);
    }
  };

  // Filter results based on active tab
  const getDisplayedResults = () => {
    if (activeTab === 'google') return googleResults;
    if (activeTab === 'community') return communityResults;
    // 'all' - merge and dedupe by title+author
    const seen = new Set();
    const merged = [];
    
    // Community first (they're more relevant)
    communityResults.forEach(book => {
      const key = `${book.title?.toLowerCase()}-${book.author?.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(book);
      }
    });
    
    // Then Google
    googleResults.forEach(book => {
      const key = `${book.title?.toLowerCase()}-${book.author?.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(book);
      }
    });
    
    return merged;
  };

  const displayedResults = getDisplayedResults();

  // Render book card
  const BookCard = ({ book }) => {
    const isAdded = addedBooks.has(book.id || book.google_books_id);
    const isAdding = addingBook === (book.id || book.google_books_id);
    const isCommunityBook = book.source === 'community';

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="flex gap-4 p-4">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-24 h-36 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
            ) : (
              <div className="w-24 h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{book.author}</p>
              </div>
              
              {/* Source badge */}
              {isCommunityBook ? (
                <Badge variant="success" size="sm" className="flex-shrink-0">
                  <Users className="w-3 h-3 mr-1" />
                  Có sẵn
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="flex-shrink-0">
                  <Globe className="w-3 h-3 mr-1" />
                  Google
                </Badge>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2 mt-2">
              {book.category && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                  {book.category}
                </span>
              )}
              {book.language && (
                <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                  {book.language === 'vi' ? '🇻🇳 Tiếng Việt' : book.language === 'en' ? '🇬🇧 English' : book.language}
                </span>
              )}
              {book.isbn && (
                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded">
                  ISBN: {book.isbn}
                </span>
              )}
              {book.publishedDate && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {book.publishedDate}
                </span>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {book.description}
              </p>
            )}

            {/* Community book owner */}
            {isCommunityBook && book.owner && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Chủ sở hữu: {book.owner.user?.full_name || 'Unknown'} • {book.owner.region || 'N/A'}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {isCommunityBook ? (
                // Community book - can request exchange
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/books/${book.book_id}`)}
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </Button>
              ) : (
                // Google book - add to library or wanted
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToLibrary(book)}
                    className="flex-1"
                  >
                    <Library className="w-4 h-4 mr-1" />
                    Tôi có sách này
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddToWanted(book)}
                    disabled={isAdding || isAdded}
                    className="flex-1"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Đã thêm
                      </>
                    ) : isAdding ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-1" />
                        Muốn có
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Khám Phá Sách</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Tìm kiếm sách từ Google Books và cộng đồng. Thêm vào thư viện hoặc danh sách mong muốn chỉ với một click!
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Tìm theo tên sách, tác giả, ISBN..."
                  className="pl-12 pr-4 py-3 text-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Tìm'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          {(googleResults.length > 0 || communityResults.length > 0) && (
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({googleResults.length + communityResults.length})
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'community'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Cộng đồng ({communityResults.length})
              </button>
              <button
                onClick={() => setActiveTab('google')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'google'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                Google Books ({googleResults.length})
              </button>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : displayedResults.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
              {displayedResults.map((book, index) => (
                <BookCard key={book.id || book.book_id || index} book={book} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy sách nào phù hợp</p>
              <p className="text-sm text-gray-400 mt-1">Thử từ khóa khác hoặc kiểm tra chính tả</p>
            </div>
          ) : (
            /* Empty state - show suggestions */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bắt đầu khám phá</h3>
                <p className="text-gray-500 mb-6">
                  Nhập tên sách hoặc tác giả để tìm kiếm
                </p>
                
                {/* Quick search suggestions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Doraemon', 'Harry Potter', 'Atomic Habits', 'Rich Dad Poor Dad', 'Conan'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setTimeout(handleSearch, 100);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookDiscoveryPage;
