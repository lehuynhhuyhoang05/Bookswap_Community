import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchBar, LoadingSpinner } from '../ui';
import { BookCard } from '../books';
import { useBooks } from '../../hooks/useBooks';

const ExchangeRequestForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  receiver,
  initialData = {}
}) => {
  const [selectedOfferedBooks, setSelectedOfferedBooks] = useState([]);
  const [selectedRequestedBooks, setSelectedRequestedBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { getMyBooks, searchBooks } = useBooks();

  useEffect(() => {
    if (initialData.message) setMessage(initialData.message);
    if (initialData.offeredBooks) setSelectedOfferedBooks(initialData.offeredBooks);
    if (initialData.requestedBooks) setSelectedRequestedBooks(initialData.requestedBooks);
  }, [initialData]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchBooks(query);
      setSearchResults(results.items || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddBook = (book, listType) => {
    if (listType === 'offered') {
      setSelectedOfferedBooks(prev => [...prev, book]);
    } else {
      setSelectedRequestedBooks(prev => [...prev, book]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveBook = (bookId, listType) => {
    if (listType === 'offered') {
      setSelectedOfferedBooks(prev => prev.filter(book => book.book_id !== bookId));
    } else {
      setSelectedRequestedBooks(prev => prev.filter(book => book.book_id !== bookId));
    }
  };

  const handleSubmit = () => {
    const requestData = {
      receiver_id: receiver.member_id,
      offered_book_ids: selectedOfferedBooks.map(book => book.book_id),
      requested_book_ids: selectedRequestedBooks.map(book => book.book_id),
      message: message.trim(),
      priority: 'NORMAL'
    };
    
    // Debug logging
    console.log('[ExchangeRequestForm] Submitting request:', {
      receiver: { id: receiver.member_id, name: receiver.full_name },
      offered_books: selectedOfferedBooks.length,
      requested_books: selectedRequestedBooks.length,
      has_message: !!message.trim()
    });
    
    onSubmit(requestData);
  };

  const isValid = selectedOfferedBooks.length > 0 && 
                  selectedRequestedBooks.length > 0 && 
                  message.trim().length > 0;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Yêu cầu trao đổi với ${receiver?.full_name}`}
      size="lg"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Phần sách muốn trao đổi */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Sách tôi muốn trao đổi</h4>
          <div className="space-y-2 mb-3">
            {selectedOfferedBooks.map(book => (
              <div key={book.book_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <BookCard book={book} compact />
                <Button 
                  variant="text" 
                  size="sm"
                  onClick={() => handleRemoveBook(book.book_id, 'offered')}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <SearchBar
              placeholder="Tìm sách của bạn để trao đổi..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
          
          {searching && (
            <div className="flex justify-center py-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchResults.map(book => (
              <BookCard 
                key={book.book_id} 
                book={book}
                compact
                actions={
                  <Button 
                    size="sm"
                    onClick={() => handleAddBook(book, 'offered')}
                    disabled={selectedOfferedBooks.some(b => b.book_id === book.book_id)}
                  >
                    Thêm
                  </Button>
                }
              />
            ))}
          </div>
        </div>

        {/* Phần sách muốn nhận */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Sách tôi muốn nhận</h4>
          <div className="space-y-2 mb-3">
            {selectedRequestedBooks.map(book => (
              <div key={book.book_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <BookCard book={book} compact />
                <Button 
                  variant="text" 
                  size="sm"
                  onClick={() => handleRemoveBook(book.book_id, 'requested')}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <SearchBar
              placeholder="Tìm sách muốn nhận..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
          
          {searching && (
            <div className="flex justify-center py-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchResults.map(book => (
              <BookCard 
                key={book.book_id} 
                book={book}
                compact
                actions={
                  <Button 
                    size="sm"
                    onClick={() => handleAddBook(book, 'requested')}
                    disabled={selectedRequestedBooks.some(b => b.book_id === book.book_id)}
                  >
                    Thêm
                  </Button>
                }
              />
            ))}
          </div>
        </div>

        {/* Phần tin nhắn */}
        <div className="mb-6">
          <Input 
            label="Tin nhắn gửi người nhận"
            type="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Viết tin nhắn thân thiện giải thích lý do bạn muốn trao đổi..."
            rows={4}
          />
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Gửi yêu cầu trao đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExchangeRequestForm;
