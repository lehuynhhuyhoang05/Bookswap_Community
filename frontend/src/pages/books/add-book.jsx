import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookForm from '../../components/books/BookForm';
import { useBooks } from '../../hooks/useBooks';

const AddBook = () => {
  const { addBook, loading, error } = useBooks();
  const navigate = useNavigate();

  const handleSubmit = async (bookData) => {
    try {
      await addBook(bookData);
      navigate('/books/my-library');
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm sách mới</h1>
            <p className="text-gray-600">
              Thêm sách vào thư viện cá nhân của bạn
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <BookForm 
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AddBook;