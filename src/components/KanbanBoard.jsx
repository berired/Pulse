import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2 } from 'lucide-react';
import './KanbanBoard.css';

const STAGES = ['To Do', 'In Progress', 'Review', 'Completed'];

function KanbanTask({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-task"
    >
      <div className="task-header">
        <h4>{task.title}</h4>
        <button
          className="delete-btn"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.due_date && (
        <div className="task-due-date">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}

      <div className="task-priority">
        <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, tasks, onAddTask, onDeleteTask }) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="column-header">
        <h3>{stage}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="tasks-list">
          {tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      <button className="add-task-btn" onClick={() => onAddTask(stage)}>
        <Plus size={18} /> Add task
      </button>
    </div>
  );
}

function KanbanBoard({ tasks, onAddTask, onDeleteTask, onTaskMove }) {
  return (
    <div className="kanban-board">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          tasks={tasks.filter((t) => t.stage === stage)}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
