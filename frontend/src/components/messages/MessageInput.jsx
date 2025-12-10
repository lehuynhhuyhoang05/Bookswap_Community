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

      {/* Attachment Preview - Enhanced */}
      {(imagePreview || selectedFile) && (
        <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-sm">
          <div className="flex items-start justify-between">
            {imagePreview ? (
              <div className="flex items-center space-x-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedImage?.name}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {(selectedImage?.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <Paperclip className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {(selectedFile?.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={clearAttachment}
              className="p-2 hover:bg-white/80 rounded-xl transition-all transform hover:scale-110"
              type="button"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
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

        {/* Action Buttons - Enhanced */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${
              showEmojiPicker ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Thêm emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all transform hover:scale-110 hidden sm:block"
            title="Đính kèm file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all transform hover:scale-110 hidden sm:block"
            title="Gửi ảnh"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Message Input - Enhanced */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          rows={1}
          disabled={disabled || uploading}
          className="flex-1 resize-none px-5 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all placeholder:text-gray-400"
          style={{
            minHeight: '48px',
            maxHeight: '120px',
          }}
        />

        {/* Send Button - Enhanced with gradient */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage && !selectedFile) || disabled || uploading}
          className={`p-3.5 rounded-2xl transition-all transform ${
            (message.trim() || selectedImage || selectedFile) && !disabled && !uploading
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={uploading ? 'Đang gửi...' : 'Gửi tin nhắn'}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;