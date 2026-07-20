import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';


export const Todos: React.FC = () => {
  const { todos, toggleTodo, addTodo, currentUser } = useSimulator();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Filter todos for currentUser
  const myTodos = todos.filter(t => t.user_id === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodo({
        title: newTodoTitle,
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        priority,
        status: 'pending',
      });
      setNewTodoTitle('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Todo List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>My Private Task List</h3>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Add a new task..." 
              required
              value={newTodoTitle} 
              onChange={e => setNewTodoTitle(e.target.value)} 
            />
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as any)}
              style={{ width: '120px' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Add Task
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myTodos.map(t => {
              const isDone = t.status === 'done';
              return (
                <div 
                  key={t.id} 
                  onClick={() => toggleTodo(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-glass)',
                    background: isDone ? 'rgba(255,255,255,0.01)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    opacity: isDone ? 0.6 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={isDone}
                      onChange={() => {}} // toggled by parent click
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ 
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      fontSize: '14px'
                    }}>
                      {t.title}
                    </span>
                  </div>

                  <span className={`badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}`} style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                    {t.priority}
                  </span>
                </div>
              );
            })}

            {myTodos.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No tasks registered. Enjoy your free day!
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
