import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(WS_URL, {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const joinBoard = (boardId) => {
  if (socket) {
    socket.emit('join:board', boardId);
  }
};

export const leaveBoard = (boardId) => {
  if (socket) {
    socket.emit('leave:board', boardId);
  }
};

export const onBoardUpdate = (callback) => {
  if (socket) {
    socket.on('board:updated', callback);
  }
};

export const onListCreated = (callback) => {
  if (socket) {
    socket.on('list:created', callback);
  }
};

export const onListUpdated = (callback) => {
  if (socket) {
    socket.on('list:updated', callback);
  }
};

export const onListDeleted = (callback) => {
  if (socket) {
    socket.on('list:deleted', callback);
  }
};

export const onTaskCreated = (callback) => {
  if (socket) {
    socket.on('task:created', callback);
  }
};

export const onTaskUpdated = (callback) => {
  if (socket) {
    socket.on('task:updated', callback);
  }
};

export const onTaskDeleted = (callback) => {
  if (socket) {
    socket.on('task:deleted', callback);
  }
};

export const onTaskAssigned = (callback) => {
  if (socket) {
    socket.on('task:assigned', callback);
  }
};

export const onTaskUnassigned = (callback) => {
  if (socket) {
    socket.on('task:unassigned', callback);
  }
};

export const onBoardMemberAdded = (callback) => {
  if (socket) {
    socket.on('board:member_added', callback);
  }
};

export const onBoardMemberRemoved = (callback) => {
  if (socket) {
    socket.on('board:member_removed', callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
