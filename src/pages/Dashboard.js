import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/api';
import { toast } from 'react-toastify';
import { FiFolder, FiFile, FiDownload, FiTrash2, FiPlus, FiChevronRight, FiHome, FiStar, FiClock, FiTrash, FiRefreshCw, FiSearch, FiGrid, FiList, FiUpload, FiCloud, FiMoreVertical, FiMenu, FiX, FiSettings, FiSun, FiMoon, FiEdit2 } from 'react-icons/fi';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [renameFile, setRenameFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles(currentFolder, currentView);
      setFiles(response.data.files);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [currentFolder, currentView]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      await fileService.createFolder({
        folderName: folderName.trim(),
        parentFolderId: currentFolder
      });
      toast.success('✨ Folder created successfully');
      setFolderName('');
      setShowNewFolderModal(false);
      fetchFiles();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    for (let file of droppedFiles) {
      try {
        setUploadProgress({ name: file.name, progress: 0 });
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('parentFolderId', currentFolder);
        }

        await fileService.uploadFile(formData);
        setUploadProgress({ name: file.name, progress: 100 });
        setTimeout(() => setUploadProgress(null), 2000);
        toast.success(`🚀 ${file.name} uploaded successfully`);
      } catch (error) {
        setUploadProgress(null);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to upload file';
        toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
      }
    }
    fetchFiles();
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    for (let file of files) {
      try {
        setUploadProgress({ name: file.name, progress: 0 });
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('parentFolderId', currentFolder);
        }

        await fileService.uploadFile(formData);
        setUploadProgress({ name: file.name, progress: 100 });
        setTimeout(() => setUploadProgress(null), 2000);
        toast.success(`🚀 ${file.name} uploaded successfully`);
      } catch (error) {
        setUploadProgress(null);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to upload file';
        toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
      }
    }
    fetchFiles();
  };

  const handleDelete = async (fileId) => {
    const isPermanent = currentView === 'trash';
    const message = isPermanent 
      ? 'Are you sure you want to permanently delete this item?' 
      : 'Are you sure you want to move this item to trash?';
      
    if (window.confirm(message)) {
      try {
        await fileService.deleteFile(fileId, isPermanent);
        toast.success(isPermanent ? '🗑️ Item permanently deleted' : '🗑️ Item moved to trash');
        fetchFiles();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleRestore = async (fileId) => {
    try {
      await fileService.restoreFile(fileId);
      toast.success('✅ Item restored successfully');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to restore item');
    }
  };

  const handleToggleStar = async (fileId) => {
    try {
      const response = await fileService.toggleStar(fileId);
      toast.success(response.data.message);
      fetchFiles();
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('⚠️ Are you sure you want to permanently delete all items in trash? This action cannot be undone.')) {
      try {
        await fileService.emptyTrash();
        toast.success('🗑️ Trash emptied successfully');
        fetchFiles();
      } catch (error) {
        toast.error('Failed to empty trash');
      }
    }
  };

  const handleRename = async () => {
    if (!newFileName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }
    try {
      await fileService.renameFile(renameFile.id, newFileName.trim());
      toast.success('✅ File renamed successfully');
      setRenameFile(null);
      setNewFileName('');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to rename file');
    }
  };

  const changeView = (view) => {
    setCurrentView(view);
    setCurrentFolder(null);
    setFolderPath([]);
  };

  const handleViewFile = async (fileId) => {
    try {
      const response = await fileService.downloadFile(fileId, false); // false = view mode
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      toast.error('❌ Failed to open file');
    }
  };

  const handleDownload = async (fileId, fileName, fileType) => {
    try {
      if (fileType === 'folder') {
        toast.info('📦 Preparing ZIP file...');
        const response = await fileService.downloadFolder(fileId);
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`✅ ${fileName}.zip downloaded successfully`);
      } else {
        const response = await fileService.downloadFile(fileId, true); // true = download mode
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`✅ ${fileName} downloading...`);
      }
    } catch (error) {
      toast.error('❌ Failed to download. Try again.');
    }
  };

  const handleFolderClick = (folderId, folderName) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
  };

  const navigateToFolder = (folderId, index) => {
    setCurrentFolder(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const navigateHome = () => {
    setCurrentFolder(null);
    setFolderPath([]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    return file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getViewTitle = () => {
    switch(currentView) {
      case 'recent': return 'Recent';
      case 'starred': return 'Starred';
      case 'trash': return 'Trash';
      default: return 'My Drive';
    }
  };

  const getFileIcon = (file) => {
    if (file.fileType === 'folder') {
      return (
        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
          <FiFolder className="text-white" size={28} />
        </div>
      );
    }
    
    const extension = file.fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return (
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
            <FiFile className="text-white" size={28} />
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <FiFile className="text-white" size={28} />
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
            <FiFile className="text-white" size={28} />
          </div>
        );
      default:
        return (
          <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg">
            <FiFile className="text-white" size={28} />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900'
    }`}>
      {/* Ambient Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-blue-300/20 to-indigo-300/20' 
            : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20'
        }`}></div>
        <div className={`absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-indigo-300/15 to-purple-300/15' 
            : 'bg-gradient-to-r from-indigo-500/15 to-blue-500/15'
        }`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-cyan-300/20 to-blue-300/20' 
            : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
        }`} style={{animationDelay: '4s'}}></div>
      </div>

      {/* Top Navigation Bar */}
      <header className={`relative z-30 backdrop-blur-xl border-b ${
        theme === 'light' 
          ? 'bg-white/90 border-gray-200 shadow-sm' 
          : 'bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-900/80 border-white/10'
      }`}>
        <div className="w-full px-2 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Left: Logo */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl md:rounded-2xl blur opacity-75"></div>
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-base sm:text-lg md:text-xl">G</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-base sm:text-xl md:text-2xl font-bold whitespace-nowrap ${
                  theme === 'light' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent'
                }`}>
                  Drive
                </h1>
              </div>
            </div>
            
            {/* Right: User Info */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-75"></div>
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-2xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className={`font-medium text-sm ${
                  theme === 'light' ? 'text-gray-700' : 'text-white'
                }`}>{user?.firstName} {user?.lastName}</span>
                <span className={`text-xs ${
                  theme === 'light' ? 'text-gray-500' : 'text-white/60'
                }`}>{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg md:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full">
        {/* Left Sidebar */}
        <aside className={`fixed left-0 top-16 md:top-20 w-64 md:w-80 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] backdrop-blur-xl border-r shadow-xl transition-transform duration-300 z-40 overflow-y-auto ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200' 
            : 'bg-gradient-to-b from-black/30 via-purple-900/30 to-indigo-900/30 border-white/10'
        }`}>
          <div className="p-4 md:p-6">
            {/* Create New Button */}
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold shadow-2xl transform group-hover:scale-105 transition-all duration-200">
                <FiPlus size={20} />
                <span>Create New</span>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 md:px-6 space-y-2">
            {[
              { id: 'home', icon: FiHome, label: 'My Drive' },
              { id: 'recent', icon: FiClock, label: 'Recent' },
              { id: 'starred', icon: FiStar, label: 'Starred' },
              { id: 'trash', icon: FiTrash, label: 'Trash' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isTrash = item.id === 'trash';
              return (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isActive ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`absolute inset-0 transition-opacity duration-300 rounded-2xl ${
                    isActive 
                      ? isTrash 
                        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-100' 
                        : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-100'
                      : 'opacity-0 group-hover:opacity-10 bg-white/10'
                  }`}></div>
                  <div className={`relative flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? theme === 'light'
                        ? 'bg-blue-100 text-blue-700 shadow-lg border border-blue-200'
                        : 'bg-white/10 text-white shadow-xl border border-white/20'
                      : theme === 'light'
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        : 'text-purple-200/70 hover:text-white hover:bg-white/5'
                  }`}>
                    <Icon size={18} className={isActive && isTrash ? (theme === 'light' ? 'text-red-600' : 'text-red-400') : ''} />
                    <span className="font-medium text-sm md:text-base">{item.label}</span>
                  </div>
                </button>
              );
            })}
            
            {currentView === 'trash' && (
              <button
                onClick={handleEmptyTrash}
                className="w-full flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all duration-200 text-xs md:text-sm mt-4 border border-red-500/20 hover:border-red-500/40"
              >
                <FiTrash2 size={16} />
                <span>Empty Trash</span>
              </button>
            )}
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className={`w-full flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl transition-all duration-200 text-xs md:text-sm mt-4 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                  : 'text-purple-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiSettings size={16} />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:ml-80 flex-1 flex flex-col h-full">
          <div className={`p-4 md:p-8 flex-shrink-0 ${
            theme === 'light' 
              ? 'bg-gradient-to-br from-white/60 via-blue-50/60 to-indigo-50/60' 
              : 'bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-blue-900/50'
          }`}>
          {/* Search Bar & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
            {/* Home Button */}
            <button 
              onClick={navigateHome} 
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl rounded-lg border font-medium transition-all text-sm flex-shrink-0 shadow-sm ${
                theme === 'light' 
                  ? 'bg-white border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400' 
                  : 'bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <FiHome size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Search Bar */}
            <div className="flex-1 min-w-0 sm:mx-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur group-focus-within:blur-md transition-all duration-300"></div>
                <div className="relative">
                  <FiSearch className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors z-10 ${
                    theme === 'light' ? 'text-gray-400' : 'text-white'
                  }`} size={18} />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 backdrop-blur-xl border rounded-full text-sm focus:ring-2 focus:ring-cyan-400/30 focus:shadow-lg focus:shadow-cyan-400/20 outline-none transition-all duration-300 ${
                      theme === 'light' 
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-cyan-500 shadow-sm' 
                        : 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-cyan-400/50'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Upload & View Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="group relative overflow-hidden cursor-pointer">
                <div className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all duration-200 ${
                  theme === 'light' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}>
                  <FiUpload size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden sm:inline text-sm font-medium">Upload</span>
                </div>
                <input type="file" multiple onChange={handleUpload} className="hidden" />
              </label>
              
              <div className={`flex bg-white/10 backdrop-blur-xl rounded-lg border overflow-hidden ${
                theme === 'light' ? 'bg-white border-gray-300 shadow-sm' : 'border-white/20'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 md:p-2.5 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? theme === 'light'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white/20 text-white'
                      : theme === 'light'
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiGrid size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 md:p-2.5 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? theme === 'light'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white/20 text-white'
                      : theme === 'light'
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiList size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          {folderPath.length > 0 && (
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-xl rounded-lg sm:rounded-xl border overflow-x-auto max-w-full scrollbar-hide mb-4 ${
              theme === 'light' 
                ? 'bg-white border-gray-300 shadow-sm' 
                : 'bg-white/10 border-white/20'
            }`}>
              <button 
                onClick={navigateHome} 
                className={`flex items-center gap-1 font-medium transition-colors text-xs sm:text-sm flex-shrink-0 ${
                  theme === 'light' 
                    ? 'text-gray-700 hover:text-blue-600' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <FiHome size={14} className="sm:w-4 sm:h-4" />
              </button>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <FiChevronRight className={theme === 'light' ? 'text-gray-400' : 'text-white/40'} size={12} />
                  <button
                    onClick={() => navigateToFolder(folder.id, index)}
                    className={`font-medium transition-colors text-xs sm:text-sm whitespace-nowrap max-w-[100px] sm:max-w-[150px] truncate ${
                      theme === 'light' 
                        ? 'text-gray-700 hover:text-blue-600' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
          </div>

          {/* Files Display - Scrollable Section */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mb-4 relative overflow-hidden rounded-2xl md:rounded-3xl transition-all duration-300 ${
              dragActive ? 'scale-105 shadow-2xl shadow-cyan-500/20' : ''
            }`}
          >
            <div className={`absolute inset-0 transition-all duration-300 ${
              dragActive 
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30' 
                : 'bg-gradient-to-r from-white/5 to-white/10'
            }`}></div>
            <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 text-center transition-all duration-300 border-2 border-dashed ${
              dragActive 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' 
                : theme === 'light'
                  ? 'border-gray-300 hover:border-gray-400 bg-white/60'
                  : 'border-white/30 hover:border-white/50 bg-white/10'
            } backdrop-blur-2xl`}>
              <FiCloud className={`mx-auto mb-3 transition-all duration-300 ${
                dragActive ? 'text-cyan-400 animate-bounce' : theme === 'light' ? 'text-gray-400' : 'text-white/60'
              }`} size={32} />
              <h3 className={`text-lg md:text-xl font-semibold mb-2 transition-colors duration-300 ${
                dragActive ? 'text-cyan-300' : theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                {dragActive ? 'Drop files here!' : 'Drag & Drop Zone'}
              </h3>
              <p className={`text-xs md:text-sm transition-colors duration-300 ${
                dragActive ? 'text-cyan-200' : theme === 'light' ? 'text-gray-600' : 'text-white/70'
              }`}>
                {dragActive
                  ? 'Release to upload your files'
                  : 'Drag files here or use the upload button'}
              </p>
            </div>
          </div>

          {/* Files Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-white/80 text-xl font-medium mt-6">Loading your files...</p>
              <p className="text-white/60">Please wait while we fetch your data</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20">
                  <div className="text-8xl mb-6">🌌</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Your digital universe awaits</h3>
                  <p className="text-white/70 text-lg mb-6">
                    {searchTerm ? 'No files match your search. Try different keywords.' : 'Upload files or create folders to begin your journey'}
                  </p>
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-xl transform hover:scale-105"
                  >
                    Create Your First Folder
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-200 ${
                    currentView === 'trash' ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    if (currentView === 'trash') return;
                    if (file.fileType === 'folder') {
                      handleFolderClick(file.id, file.fileName);
                    } else {
                      handleViewFile(file.id);
                    }
                  }}
                >
                  <div className={`relative backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 border hover:shadow-lg transition-all duration-200 h-full flex flex-col ${
                    file.isStarred ? 'ring-2 ring-yellow-400/50' : ''
                  } ${
                    currentView === 'trash' ? 'bg-red-100/80 border-red-300' : theme === 'light' ? 'bg-white border-gray-300 shadow-sm' : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}>
                    {/* Icon */}
                    <div className="relative mx-auto mb-2 sm:mb-3">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center ${
                        file.fileType === 'folder' 
                          ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {file.fileType === 'folder' ? (
                          <FiFolder className="text-white" size={24} />
                        ) : (
                          <FiFile className="text-white" size={24} />
                        )}
                      </div>
                      {file.isStarred && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <FiStar className="text-white" size={8} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Name */}
                    <div className="flex-1 mb-2">
                      <h4 className={`font-medium text-xs sm:text-sm text-center truncate ${
                        currentView === 'trash' ? 'line-through text-gray-500' : theme === 'light' ? 'text-gray-800' : 'text-white'
                      }`} title={file.fileName}>
                        {file.fileName}
                      </h4>
                      {file.fileType !== 'folder' && (
                        <p className={`text-[10px] sm:text-xs text-center mt-1 ${
                          theme === 'light' ? 'text-gray-500' : 'text-white/50'
                        }`}>
                          {formatFileSize(file.fileSize)}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {currentView === 'trash' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestore(file.id); }}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                            theme === 'light' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-green-500/30 text-green-300 hover:bg-green-500/50'
                          }`}
                          title="Restore"
                        >
                          <FiRefreshCw size={14} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRenameFile(file); setNewFileName(file.fileName); }}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                              theme === 'light' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/50'
                            }`}
                            title="Rename"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                              file.isStarred 
                                ? theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/40 text-yellow-200'
                                : theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/20 text-white/80'
                            }`}
                            title={file.isStarred ? 'Unstar' : 'Star'}
                          >
                            <FiStar size={14} fill={file.isStarred ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(file.id, file.fileName, file.fileType); }}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                              theme === 'light' ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' : 'bg-cyan-500/30 text-cyan-300 hover:bg-cyan-500/50'
                            }`}
                            title="Download"
                          >
                            <FiDownload size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                          theme === 'light' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-red-500/30 text-red-300 hover:bg-red-500/50'
                        }`}
                        title={currentView === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className={`backdrop-blur-2xl border shadow-2xl overflow-x-auto ${
                theme === 'light' ? 'bg-white border-gray-300' : 'bg-white/10 border-white/20'
              }`}>
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={`group px-1.5 py-1.5 md:px-3 md:py-2 border-b flex items-center gap-1.5 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                      index % 2 === 0 
                        ? theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        : 'bg-transparent'
                    } ${
                      currentView === 'trash' ? 'opacity-60' : ''
                    } ${
                      theme === 'light' ? 'border-gray-200 hover:bg-blue-50' : 'border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (currentView === 'trash') return;
                      if (file.fileType === 'folder') {
                        handleFolderClick(file.id, file.fileName);
                      } else {
                        handleViewFile(file.id);
                      }
                    }}
                  >
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        file.fileType === 'folder' 
                          ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {file.fileType === 'folder' ? (
                          <FiFolder className="text-white" size={12} />
                        ) : (
                          <FiFile className="text-white" size={12} />
                        )}
                      </div>
                      {file.isStarred && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <FiStar className="text-white" size={5} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-[11px] md:text-xs truncate ${
                        currentView === 'trash' ? 'line-through text-gray-400' : theme === 'light' ? 'text-gray-800' : 'text-white'
                      }`}>{file.fileName}</div>
                      <div className={`flex gap-1 text-[9px] md:text-[10px] ${
                        theme === 'light' ? 'text-gray-500' : 'text-white/50'
                      }`}>
                        {file.fileType !== 'folder' && <span className="whitespace-nowrap">{formatFileSize(file.fileSize)}</span>}
                        {file.fileType !== 'folder' && <span>•</span>}
                        <span className="whitespace-nowrap">{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                      {currentView === 'trash' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestore(file.id); }}
                          className={`p-1 md:p-2 rounded md:rounded-lg transition-all ${
                            theme === 'light' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-green-500/30 text-green-300 hover:bg-green-500/50'
                          }`}
                          title="Restore"
                        >
                          <FiRefreshCw size={11} className="md:w-[15px] md:h-[15px]" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRenameFile(file); setNewFileName(file.fileName); }}
                            className={`p-1 md:p-2 rounded md:rounded-lg transition-all ${
                              theme === 'light' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/50'
                            }`}
                            title="Rename"
                          >
                            <FiEdit2 size={11} className="md:w-[15px] md:h-[15px]" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                            className={`p-1 md:p-2 rounded md:rounded-lg transition-all ${
                              file.isStarred 
                                ? theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/40 text-yellow-200'
                                : theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/20 text-white/80'
                            }`}
                            title={file.isStarred ? 'Unstar' : 'Star'}
                          >
                            <FiStar size={11} className="md:w-[15px] md:h-[15px]" fill={file.isStarred ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(file.id, file.fileName, file.fileType); }}
                            className={`p-1 md:p-2 rounded md:rounded-lg transition-all ${
                              theme === 'light' ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' : 'bg-cyan-500/30 text-cyan-300 hover:bg-cyan-500/50'
                            }`}
                            title="Download"
                          >
                            <FiDownload size={11} className="md:w-[15px] md:h-[15px]" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                        className={`p-1 md:p-2 rounded md:rounded-lg transition-all ${
                          theme === 'light' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-red-500/30 text-red-300 hover:bg-red-500/50'
                        }`}
                        title={currentView === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                      >
                        <FiTrash2 size={11} className="md:w-[15px] md:h-[15px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Upload Progress Modal */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUpload className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Uploading...</h3>
              <p className="text-white/70 mb-4">{uploadProgress.name}</p>
              <div className="w-64 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{width: `${uploadProgress.progress}%`}}
                ></div>
              </div>
              <p className="text-white/60 text-sm mt-2">{uploadProgress.progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md mx-4 shadow-2xl border border-white/20">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Create New Folder</h2>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                autoFocus
                className="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl mb-4 md:mb-6 text-white text-sm md:text-base placeholder-white/50 focus:bg-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setFolderName('');
                  }}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-white/10 text-white/70 rounded-xl md:rounded-2xl hover:bg-white/20 hover:text-white transition-all font-medium text-sm md:text-base border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl md:rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all font-medium text-sm md:text-base shadow-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white transition-colors">
                  <FiX size={24} />
                </button>
              </div>
              
              {/* Theme Toggle */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Theme</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTheme('light'); toast.success('Light theme activated!'); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        theme === 'light' 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <FiSun size={18} />
                      <span className="text-sm">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        theme === 'dark' 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <FiMoon size={18} />
                      <span className="text-sm">Dark</span>
                    </button>
                  </div>
                </div>

                {/* View Mode Default */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Default View</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <FiGrid size={18} />
                      <span className="text-sm">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        viewMode === 'list' 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <FiList size={18} />
                      <span className="text-sm">List</span>
                    </button>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <span className="text-white font-medium block mb-2">Account</span>
                  <div className="text-white/70 text-sm space-y-1">
                    <p>{user?.firstName} {user?.lastName}</p>
                    <p className="text-white/50">{user?.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
            <div className={`relative backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border ${
              theme === 'light' ? 'bg-white border-gray-300' : 'bg-white/10 border-white/20'
            }`}>
              <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>Rename File</h2>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new name..."
                autoFocus
                className={`w-full px-4 py-2 md:py-3 backdrop-blur-xl border rounded-xl md:rounded-2xl mb-4 md:mb-6 text-sm md:text-base outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30'
                    : 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/30'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setRenameFile(null); setNewFileName(''); }}
                  className={`flex-1 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all font-medium text-sm md:text-base border ${
                    theme === 'light' 
                      ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl md:rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all font-medium text-sm md:text-base shadow-lg"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;