import React, { useState, useEffect } from 'react';
import { stringify } from '../services/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, PlusCircle, UserCheck } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Load tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem('campusai_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Save tasks on change
  useEffect(() => {
    localStorage.setItem('campusai_tasks', stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <UserCheck className="text-blue-600" /> My Tasks
        </h3>
        <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
          {completedCount} / {tasks.length} Done
        </span>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-6 shrink-0">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
        />
        <button 
          type="submit"
          disabled={!newTask.trim()}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle size={20} />
        </button>
      </form>

      <div className="overflow-y-auto flex-grow pr-2 space-y-2 -mr-2">
        <AnimatePresence initial={false}>
          {tasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm"
            >
              No tasks yet. Add one above!
            </motion.div>
          )}
          {tasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                task.completed 
                  ? 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800' 
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm'
              }`}
            >
              <div 
                className="flex items-center gap-3 cursor-pointer flex-grow"
                onClick={() => toggleTask(task.id)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                  task.completed 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {task.completed && <Check size={14} strokeWidth={3} />}
                </div>
                <span className={`text-sm select-none break-words ${
                  task.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200 font-medium'
                }`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={() => removeTask(task.id)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-colors"
                aria-label="Remove task"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskList;
