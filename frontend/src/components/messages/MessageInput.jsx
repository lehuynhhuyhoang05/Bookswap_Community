import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import messagesApi from '../../services/api/messages';

const MessageInput = ({ onSendMessage, disabled = false, conversationId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((message.trim() || selectedImage || selectedFile) && !disabled && !uploading) {
      try {
        setUploading(true);
        let messageData = { content: message.trim() };

        // Upload file/image first if exists
        if (selectedImage || selectedFile) {
          const fileToUpload = selectedImage || selectedFile;
          console.log('📎 Uploading file:', fileToUpload.name);
          
          try {
            const uploadResponse = await messagesApi.uploadAttachment(fileToUpload, conversationId);
            messageData.attachment_url = uploadResponse.url || uploadResponse.file_url;
            messageData.attachment_type = selectedImage ? 'image' : 'file';
            messageData.attachment_name = uploadResponse.file_name || fileToUpload.name;
            messageData.attachment_size = uploadResponse.file_size || fileToUpload.size;
            console.log('✅ Upload success:', uploadResponse);
          } catch (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            alert(uploadError.message || 'Upload file thất bại. Vui lòng thử lại.');
            setUploading(false);
            return;
          }
        }
        
        // Send message with or without attachment
        await onSendMessage(messageData.content, messageData);
        
        // Clear form
        setMessage('');
        setSelectedImage(null);
        setSelectedFile(null);
        setImagePreview(null);
        setShowEmojiPicker(false);
      } catch (error) {
        console.error('❌ Send message failed:', error);
        alert('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    
    // Move cursor after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (jpg, png, gif...)');
        return;
      }
      
      // Check size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 10MB');
        return;
      }

      setSelectedImage(file);
      setSelectedFile(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('File không được hỗ trợ! Chỉ chấp nhận: PDF, Word, Excel, ZIP, TXT');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // Check size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setSelectedFile(file);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const clearAttachment = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            searchPlaceholder="Tìm emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Attachment Preview */}
      {(imagePreview || selectedFile) && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            {imagePreview ? (
              <div className="flex items-center space-x-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedImage?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedImage?.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile?.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={clearAttachment}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 hover:bg-blue-50 rounded-lg transition-colors ${
              showEmojiPicker ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
            }`}
            title="Thêm emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
            title="Đính kèm file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
            title="Gửi ảnh"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Message Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Aa"
          rows={1}
          disabled={disabled || uploading}
          className="flex-1 resize-none px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{
            minHeight: '48px',
            maxHeight: '120px',
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage && !selectedFile) || disabled || uploading}
          className={`p-3 rounded-full transition-all ${
            (message.trim() || selectedImage || selectedFile) && !disabled && !uploading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={uploading ? 'Đang gửi...' : 'Gửi tin nhắn'}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;