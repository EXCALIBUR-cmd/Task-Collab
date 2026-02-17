import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useBoard } from '../context/BoardContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ActivityPanel from '../components/ActivityPanel';
import '../styles/Board.css';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentBoard,
    lists,
    tasks,
    loading,
    loadBoard,
    createList,
    createTask,
    updateTask,
    deleteTask,
    leaveBoard,
  } = useBoard();

  const [showListInput, setShowListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(false);

  useEffect(() => {
    loadBoard(id);
    return () => {
      leaveBoard();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await createList(id, newListName, lists.length);
      setNewListName('');
      setShowListInput(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleCreateTask = async (listId) => {
    const title = prompt('Enter task title:');
    if (!title) return;

    try {
      const listTasks = tasks[listId] || [];
      await createTask(listId, title, '', listTasks.length);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    console.log('Drag ended:', { destination, source, draggableId });

    if (!destination) {
      console.log('No destination - drag cancelled');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Same position - no change needed');
      return;
    }

    // Keep IDs as strings - they can be "temp-*" strings or numeric strings
    // The backend will parse numeric strings correctly, and temp IDs will be handled by BoardContext
    const destListId = destination.droppableId;
    const taskId = draggableId;

    console.log('Moving task:', { taskId, destListId, position: destination.index });

    try {
      await updateTask(taskId, {
        listId: destListId,
        position: destination.index,
      });
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  if (!currentBoard) {
    return <div className="loading">Board not found</div>;
  }

  return (
    <div className="board-container">
      <header className="board-header">
        <div className="board-header-left">
          <button onClick={() => navigate('/boards')} className="back-btn">
            ← Back
          </button>
          <h1>{currentBoard.name}</h1>
        </div>
        <div className="board-header-right">
          <button onClick={() => setShowActivityPanel(!showActivityPanel)} className="btn-secondary">
            {showActivityPanel ? 'Hide' : 'Show'} Activity
          </button>
        </div>
      </header>

      <div className="board-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lists-container">
            {lists.map((list) => (
              <div key={list.id} className="list">
                <div className="list-header">
                  <h3>{list.name}</h3>
                  <span className="task-count">{(tasks[list.id] || []).length}</span>
                </div>

                <Droppable droppableId={list.id.toString()}>
                  {(provided, snapshot) => (
                    <div
                      className={`tasks-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {(tasks[list.id] || [])
                        .sort((a, b) => a.position - b.position)
                        .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard 
                                task={task} 
                                isDragging={snapshot.isDragging}
                                onClick={() => {
                                  if (!snapshot.isDragging) {
                                    setSelectedTask(task);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  className="add-task-btn"
                  onClick={() => handleCreateTask(list.id)}
                >
                  + Add Task
                </button>
              </div>
            ))}

            <div className="list add-list">
              {showListInput ? (
                <form onSubmit={handleCreateList}>
                  <input
                    type="text"
                    placeholder="Enter list name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      if (!newListName.trim()) {
                        setShowListInput(false);
                      }
                    }}
                  />
                  <div className="list-input-actions">
                    <button type="submit" className="btn-primary">
                      Add List
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowListInput(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="add-list-btn"
                  onClick={() => setShowListInput(true)}
                >
                  + Add List
                </button>
              )}
            </div>
          </div>
        </DragDropContext>

        {showActivityPanel && <ActivityPanel boardId={id} />}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
};

export default Board;
