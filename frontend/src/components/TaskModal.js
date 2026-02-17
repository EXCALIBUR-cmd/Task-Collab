import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useBoard } from '../context/BoardContext';

const TaskModal = ({ task, onClose, onUpdate, onDelete }) => {
  const { boardMembers, assignUserToTask, unassignUserFromTask } = useBoard();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignments, setAssignments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadTaskDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const loadTaskDetails = async () => {
    try {
      const response = await taskAPI.getTask(task.id);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Failed to load task details:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task.id, { title, description });
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete(task.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    
    setAssigning(true);
    try {
      await assignUserToTask(task.id, parseInt(selectedUserId));
      await loadTaskDetails();
      setSelectedUserId('');
    } catch (error) {
      console.error('Failed to assign user:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignUser = async (userId) => {
    setAssigning(true);
    try {
      await unassignUserFromTask(task.id, userId);
      await loadTaskDetails();
    } catch (error) {
      console.error('Failed to unassign user:', error);
    } finally {
      setAssigning(false);
    }
  };

  // Get available users (not already assigned)
  const availableUsers = boardMembers.filter(
    (member) => !assignments.some((assigned) => assigned.id === member.id)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="task-title-input"
          />
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Assigned Members</label>
            {assignments.length > 0 ? (
              <div className="assignments">
                {assignments.map((user) => (
                  <div key={user.id} className="assignment-tag">
                    <span>{user.name}</span>
                    <button
                      onClick={() => handleUnassignUser(user.id)}
                      className="remove-assignment-btn"
                      disabled={assigning}
                      title="Remove user"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-assignments">No members assigned</p>
            )}
            
            {availableUsers.length > 0 && (
              <div className="assign-user-controls">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="user-select"
                  disabled={assigning}
                >
                  <option value="">Select a member...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignUser}
                  className="btn-assign"
                  disabled={!selectedUserId || assigning}
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
