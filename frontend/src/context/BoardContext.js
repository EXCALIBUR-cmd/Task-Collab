import React, { createContext, useState, useContext, useEffect } from 'react';
import { boardAPI, listAPI, taskAPI } from '../services/api';
import {
  joinBoard,
  leaveBoard,
  onListCreated,
  onListUpdated,
  onListDeleted,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTaskAssigned,
  onTaskUnassigned,
  onBoardMemberAdded,
  onBoardMemberRemoved,
} from '../services/socket';

const BoardContext = createContext();

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
};

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onListCreated((list) => {
      setLists((prev) => [...prev, list]);
      setTasks((prev) => ({ ...prev, [list.id]: [] }));
    });

    onListUpdated((list) => {
      setLists((prev) => prev.map((l) => (l.id === list.id ? list : l)));
    });

    onListDeleted(({ listId }) => {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setTasks((prev) => {
        const newTasks = { ...prev };
        delete newTasks[listId];
        return newTasks;
      });
    });

    onTaskCreated((task) => {
      setTasks((prev) => {
        const newTasks = { ...prev };
        if (!newTasks[task.list_id]) {
          newTasks[task.list_id] = [];
        }
        newTasks[task.list_id] = [...newTasks[task.list_id], task].sort((a, b) => a.position - b.position);
        return newTasks;
      });
    });

    onTaskUpdated((task) => {
      setTasks((prev) => {
        const newTasks = { ...prev };
        
        // Remove task from old list if it moved
        Object.keys(newTasks).forEach((listId) => {
          newTasks[listId] = newTasks[listId].filter((t) => t.id !== task.id);
        });
        
        // Add task to new list and sort by position
        if (!newTasks[task.list_id]) {
          newTasks[task.list_id] = [];
        }
        newTasks[task.list_id].push(task);
        newTasks[task.list_id].sort((a, b) => a.position - b.position);
        
        return newTasks;
      });
    });

    onTaskDeleted(({ taskId }) => {
      setTasks((prev) => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach((listId) => {
          newTasks[listId] = newTasks[listId].filter((t) => t.id !== taskId);
        });
        return newTasks;
      });
    });

    onTaskAssigned(({ taskId, assignments }) => {
      setTasks((prev) => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach((listId) => {
          newTasks[listId] = newTasks[listId].map((task) =>
            String(task.id) === String(taskId)
              ? { ...task, assignments }
              : task
          );
        });
        return newTasks;
      });
    });

    onTaskUnassigned(({ taskId, userId }) => {
      setTasks((prev) => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach((listId) => {
          newTasks[listId] = newTasks[listId].map((task) => {
            if (String(task.id) === String(taskId) && task.assignments) {
              return {
                ...task,
                assignments: task.assignments.filter((u) => u.id !== userId),
              };
            }
            return task;
          });
        });
        return newTasks;
      });
    });

    onBoardMemberAdded(({ members }) => {
      setBoardMembers(members);
    });

    onBoardMemberRemoved(({ userId }) => {
      setBoardMembers((prev) => prev.filter((m) => m.id !== userId));
    });
  }, []);

  const loadBoards = async (params) => {
    console.log('📋 loadBoards called with params:', params);
    setLoading(true);
    try {
      console.log('🌐 Making API request to /api/boards...');
      const response = await boardAPI.getBoards(params);
      console.log('✅ API Response received:', response);
      console.log('📊 Boards data:', response.data);
      setBoards(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load boards:', error);
      console.error('📊 Error details:', error.response?.data || error.message);
      throw error;
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const loadBoard = async (boardId) => {
    setLoading(true);
    try {
      const [boardResponse, listsResponse] = await Promise.all([
        boardAPI.getBoard(boardId),
        listAPI.getLists(boardId),
      ]);

      setCurrentBoard(boardResponse.data);
      setLists(listsResponse.data);
      setBoardMembers(boardResponse.data.members || []);

      const tasksData = {};
      for (const list of listsResponse.data) {
        const taskResponse = await taskAPI.getTasksByList(list.id);
        // Sort tasks by position
        tasksData[list.id] = (taskResponse.data || []).sort((a, b) => a.position - b.position);
      }
      setTasks(tasksData);

      joinBoard(boardId);
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (name) => {
    const response = await boardAPI.createBoard({ name });
    setBoards((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateBoard = async (boardId, data) => {
    const response = await boardAPI.updateBoard(boardId, data);
    setCurrentBoard(response.data);
    return response.data;
  };

  const deleteBoard = async (boardId) => {
    console.log('📡 Calling delete API for board:', boardId);
    const response = await boardAPI.deleteBoard(boardId);
    console.log('📡 Delete API response:', response);
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    return response.data;
  };

  const createList = async (boardId, name, position) => {
    // Optimistic update
    const tempList = {
      id: `temp-${Date.now()}`, // Temporary string ID
      board_id: boardId,
      name,
      position,
      created_at: new Date().toISOString()
    };
    
    setLists((prev) => [...prev, tempList]);
    setTasks((prev) => ({ ...prev, [tempList.id]: [] }));
    
    try {
      const response = await listAPI.createList(boardId, { name, position });
      
      // Replace temp list with real one
      setLists((prev) => prev.map(l => l.id === tempList.id ? response.data : l));
      setTasks((prev) => {
        const newTasks = { ...prev };
        newTasks[response.data.id] = newTasks[tempList.id] || [];
        delete newTasks[tempList.id];
        return newTasks;
      });
      
      return response.data;
    } catch (error) {
      // Rollback on error
      setLists((prev) => prev.filter(l => l.id !== tempList.id));
      setTasks((prev) => {
        const newTasks = { ...prev };
        delete newTasks[tempList.id];
        return newTasks;
      });
      throw error;
    }
  };

  const updateList = async (listId, data) => {
    const response = await listAPI.updateList(listId, data);
    return response.data;
  };

  const deleteList = async (listId) => {
    await listAPI.deleteList(listId);
  };

  const createTask = async (listId, title, description, position) => {
    // Optimistic update
    const tempTask = {
      id: `temp-${Date.now()}`, // Temporary string ID
      list_id: listId,
      title,
      description: description || '',
      position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTasks((prev) => {
      const newTasks = { ...prev };
      if (!newTasks[listId]) {
        newTasks[listId] = [];
      }
      newTasks[listId] = [...newTasks[listId], tempTask].sort((a, b) => a.position - b.position);
      return newTasks;
    });
    
    try {
      const response = await taskAPI.createTask(listId, { title, description, position });
      
      // Replace temp task with real one
      setTasks((prev) => {
        const newTasks = { ...prev };
        newTasks[listId] = newTasks[listId]
          .map(t => t.id === tempTask.id ? response.data : t)
          .sort((a, b) => a.position - b.position);
        return newTasks;
      });
      
      return response.data;
    } catch (error) {
      // Rollback on error
      setTasks((prev) => {
        const newTasks = { ...prev };
        newTasks[listId] = newTasks[listId].filter(t => t.id !== tempTask.id);
        return newTasks;
      });
      throw error;
    }
  };

  const updateTask = async (taskId, data) => {
    // Skip API call for temporary tasks
    const isTemporary = typeof taskId === 'string' && taskId.startsWith('temp-');
    
    // Helper to compare IDs (handles both string and numeric IDs)
    const isSameId = (a, b) => String(a) === String(b);
    
    // Optimistic update for drag-and-drop
    if (data.listId !== undefined && data.position !== undefined) {
      setTasks((prev) => {
        const newTasks = { ...prev };
        
        // Find and remove task from current list
        let movedTask = null;
        Object.keys(newTasks).forEach((listId) => {
          const task = newTasks[listId].find((t) => isSameId(t.id, taskId));
          if (task) {
            movedTask = { ...task, list_id: data.listId, position: data.position };
            newTasks[listId] = newTasks[listId].filter((t) => !isSameId(t.id, taskId));
          }
        });
        
        // Add to new list at position
        if (movedTask) {
          const destListKey = Object.keys(newTasks).find(k => isSameId(k, data.listId)) || data.listId;
          if (!newTasks[destListKey]) {
            newTasks[destListKey] = [];
          }
          newTasks[destListKey].splice(data.position, 0, movedTask);
          
          // Update positions for all tasks in destination list
          newTasks[destListKey] = newTasks[destListKey].map((task, idx) => ({
            ...task,
            position: idx
          }));
        }
        
        return newTasks;
      });
    } 
    // Optimistic update for title/description changes
    else if (data.title !== undefined || data.description !== undefined) {
      setTasks((prev) => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach((listId) => {
          newTasks[listId] = newTasks[listId].map((task) => 
            isSameId(task.id, taskId)
              ? { ...task, ...data }
              : task
          );
        });
        return newTasks;
      });
    }
    
    // Don't call API for temporary tasks - wait for real ID from createTask
    if (isTemporary) {
      return; // Optimistic update already applied
    }
    
    const response = await taskAPI.updateTask(taskId, data);
    return response.data;
  };

  const deleteTask = async (taskId) => {
    // Skip API call for temporary tasks
    const isTemporary = typeof taskId === 'string' && taskId.startsWith('temp-');
    
    // Helper to compare IDs (handles both string and numeric IDs)
    const isSameId = (a, b) => String(a) === String(b);
    
    // Optimistic delete
    setTasks((prev) => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach((listId) => {
        newTasks[listId] = newTasks[listId].filter((t) => !isSameId(t.id, taskId));
      });
      return newTasks;
    });
    
    // Don't call API for temporary tasks
    if (!isTemporary) {
      await taskAPI.deleteTask(taskId);
    }
  };

  const moveTask = async (taskId, sourceListId, destListId, destPosition) => {
    const response = await taskAPI.updateTask(taskId, {
      listId: destListId,
      position: destPosition,
    });
    return response.data;
  };

  const assignUserToTask = async (taskId, userId) => {
    const response = await taskAPI.assignUser(taskId, { userId });
    return response.data;
  };

  const unassignUserFromTask = async (taskId, userId) => {
    await taskAPI.unassignUser(taskId, userId);
  };

  const leaveBoardHandler = () => {
    if (currentBoard) {
      leaveBoard(currentBoard.id);
    }
    setCurrentBoard(null);
    setLists([]);
    setTasks({});
    setBoardMembers([]);
  };

  const value = {
    boards,
    currentBoard,
    lists,
    tasks,
    boardMembers,
    loading,
    loadBoards,
    loadBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createList,
    updateList,
    deleteList,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    assignUserToTask,
    unassignUserFromTask,
    leaveBoard: leaveBoardHandler,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
