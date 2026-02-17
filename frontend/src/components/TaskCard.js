import React from 'react';

const TaskCard = ({ task, isDragging, onClick }) => {
  return (
    <div 
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        if (onClick && !isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <h4>{task.title}</h4>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
    </div>
  );
};

export default TaskCard;
