import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import '../styles/Boards.css';

const Boards = () => {
  const { user, logout } = useAuth();
  const { boards, loading, loadBoards, createBoard, deleteBoard } = useBoard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      console.log('🔍 Starting to fetch boards...');
      console.log('👤 Current user:', user);
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));
      
      try {
        const result = await loadBoards();
        console.log('✅ Boards loaded successfully:', result);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading boards:', err);
        console.error('📊 Error response:', err.response);
        setError(err.response?.data?.error || 'Failed to load boards. Please try again.');
      }
    };
    
    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const board = await createBoard(newBoardName);
      setNewBoardName('');
      setShowCreateModal(false);
      navigate(`/board/${board.id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        console.log('🗑️ Attempting to delete board:', boardId);
        await deleteBoard(boardId);
        console.log('✅ Board deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete board:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to delete board';
        alert(`Error: ${errorMsg}`);
      }
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boards-container">
      <header className="boards-header">
        <div className="header-content">
          <h1>Task Collab</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="boards-content">
        <div className="boards-top">
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + Create Board
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            padding: '16px', 
            margin: '20px',
            color: '#c33'
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginLeft: '16px' }}
              className="btn-secondary"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading boards...</div>
        ) : (
          <div className="boards-grid">
            {filteredBoards.map((board) => (
              <div
                key={board.id}
                className="board-card"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <div className="board-card-content">
                  <h3>{board.name}</h3>
                  <p className="board-owner">Owner: {board.owner_name}</p>
                </div>
                {board.owner_id === user?.id && (
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredBoards.length === 0 && (
          <div className="empty-state">
            <p>No boards found. Create one to get started!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                placeholder="Board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                autoFocus
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;
