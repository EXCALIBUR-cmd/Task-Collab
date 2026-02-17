import { render, screen } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

describe('TaskCard Component', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description'
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles task without description', () => {
    const taskWithoutDesc = { ...mockTask, description: '' };
    render(<TaskCard task={taskWithoutDesc} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
