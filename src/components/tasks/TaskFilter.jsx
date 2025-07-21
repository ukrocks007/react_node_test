/**
 * TaskFilter Component
 * 
 * A comprehensive task filtering component that allows users to filter tasks
 * by completion status and search by title. Implements real-time filtering
 * with localStorage integration for persistent data access.
 * 
 * Features:
 * - Filter tasks by completion status (All/Complete/Incomplete)
 * - Search tasks by title with real-time results
 * - Supports both progress-based and status-based task systems
 * - Responsive design with mobile optimization
 * - Accessibility support with ARIA attributes
 * - Integration with localStorage for data persistence
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaSpinner, FaExclamationTriangle, FaTasks, FaCheck, FaFlag, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Sidebar from "../../components/admin/Sidebar";

const TaskFilter = () => {
  // State management with proper initialization
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    priority: 'all'
  });
  const [counts, setCounts] = useState({
    all: 0,
    complete: 0,
    incomplete: 0
  });

  /**
   * Normalize task data to handle different task structures
   * Supports both progress-based (0-100) and status-based ('complete'/'incomplete') systems
   * 
   * @param {Object} task - Raw task object
   * @returns {Object} Normalized task object
   */
  const normalizeTask = (task) => {
    let status = 'incomplete';
    
    // Determine completion status from different possible fields
    if (task.status === 'complete') {
      status = 'complete';
    } else if (task.status === 'incomplete') {
      status = 'incomplete';
    } else if (typeof task.progress === 'number') {
      // Progress-based system: >80 is complete
      status = task.progress > 80 ? 'complete' : 'incomplete';
    }
    
    // Normalize other fields
    const normalizedTask = {
      id: task.id || task._id || Date.now().toString(),
      title: task.title || 'Untitled Task',
      description: task.description || '',
      status: status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate || task.deadline || null,
      createdAt: task.createdAt || new Date().toISOString(),
      progress: task.progress || (status === 'complete' ? 100 : 0),
      assignedTo: task.assignedTo || 'Unassigned'
    };
    
    return normalizedTask;
  };

  /**
   * Load tasks from localStorage
   * Uses localStorage for cross-component data sharing
   */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Simulate network delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get tasks from localStorage
        const storedTasks = localStorage.getItem('tasks');
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          // Normalize all tasks to ensure consistent structure
          const normalizedTasks = parsedTasks.map(normalizeTask);
          setTasks(normalizedTasks);
          
          // Apply initial filtering
          applyFilters(normalizedTasks, filters);
          
          // Calculate counts
          updateCounts(normalizedTasks);
        } else {
          // Initialize with sample tasks if no tasks exist
          const sampleTasks = [
            {
              _id: '1',
              title: 'Complete project documentation',
              description: 'Write comprehensive documentation for the new feature',
              status: 'incomplete',
              priority: 'high',
              dueDate: new Date(Date.now() + 86400000).toISOString(),
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              title: 'Fix navigation bug',
              description: 'Address the issue with sidebar navigation on mobile devices',
              status: 'complete',
              priority: 'medium',
              dueDate: new Date().toISOString(),
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              _id: '3',
              title: 'Implement user feedback',
              description: 'Add the user feedback form to the dashboard',
              status: 'incomplete',
              priority: 'low',
              dueDate: new Date(Date.now() + 172800000).toISOString(),
              createdAt: new Date(Date.now() - 172800000).toISOString()
            }
          ];
          
          const normalizedSampleTasks = sampleTasks.map(normalizeTask);
          setTasks(normalizedSampleTasks);
          applyFilters(normalizedSampleTasks, filters);
          updateCounts(normalizedSampleTasks);
          
          // Store sample tasks in localStorage
          localStorage.setItem('tasks', JSON.stringify(sampleTasks));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // Set up event listener for storage changes from other components
    const handleStorageChange = (e) => {
      if (e.key === 'tasks') {
        try {
          const updatedTasks = JSON.parse(e.newValue || '[]');
          const normalizedTasks = updatedTasks.map(normalizeTask);
          setTasks(normalizedTasks);
          applyFilters(normalizedTasks, filters);
          updateCounts(normalizedTasks);
        } catch (err) {
          console.error('Error parsing tasks from storage:', err);
        }
      }
    };
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Update task counts by status
   * 
   * @param {Array} taskList - List of tasks to count
   */
  const updateCounts = (taskList) => {
    const completeTasks = taskList.filter(task => task.status === 'complete').length;
    const incompleteTasks = taskList.filter(task => task.status === 'incomplete').length;
    
    setCounts({
      all: taskList.length,
      complete: completeTasks,
      incomplete: incompleteTasks
    });
  };

  /**
   * Apply filters to tasks based on current filter settings
   * Memoized with useCallback to prevent unnecessary re-renders
   * 
   * @param {Array} taskList - List of tasks to filter
   * @param {Object} filterSettings - Current filter settings
   */
  const applyFilters = useCallback((taskList, filterSettings) => {
    let result = [...taskList];
    
    // Apply status filter
    if (filterSettings.status !== 'all') {
      result = result.filter(task => task.status === filterSettings.status);
    }
    
    // Apply priority filter
    if (filterSettings.priority !== 'all') {
      result = result.filter(task => 
        task.priority && task.priority.toLowerCase() === filterSettings.priority.toLowerCase()
      );
    }
    
    // Apply search filter
    if (filterSettings.search.trim()) {
      const searchTerm = filterSettings.search.toLowerCase().trim();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm) || 
        task.description.toLowerCase().includes(searchTerm) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredTasks(result);
  }, []);

  /**
   * Handle filter changes
   * 
   * @param {string} filterType - Type of filter to change
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    applyFilters(tasks, newFilters);
  };

  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    const resetFilters = { status: 'all', search: '', priority: 'all' };
    setFilters(resetFilters);
    applyFilters(tasks, resetFilters);
  };

  /**
   * Get appropriate CSS classes for priority badge
   * 
   * @param {string} priority - Task priority level
   * @returns {string} CSS class names
   */
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format date for display
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  /**
   * Check if task is overdue
   * 
   * @param {string} dueDate - Task due date
   * @returns {boolean} Whether task is overdue
   */
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  /**
   * Check if task is due today
   * 
   * @param {string} dueDate - Task due date
   * @returns {boolean} Whether task is due today
   */
  const isDueToday = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 flex justify-center items-center" aria-live="polite" role="status">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <FaSpinner className="animate-spin text-blue-500 text-3xl mb-4" aria-hidden="true" />
          <span className="text-gray-700 text-lg">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-lg" aria-live="assertive" role="alert">
          <div className="flex items-center text-red-500 mb-4">
            <FaExclamationTriangle className="mr-2 text-2xl" aria-hidden="true" />
            <span className="text-lg font-semibold">Error Loading Tasks</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-2">
            <FaTasks className="mr-3 text-blue-600" aria-hidden="true" />
            Task Filter & Search
          </h1>
          <p className="text-gray-600">Filter and search through your tasks to find exactly what you need.</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Tasks
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  type="text"
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search by title, description, or assignee"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  aria-label="Search tasks"
                />
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" aria-hidden="true" />
                </div>
                <select
                  id="status-filter"
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  aria-label="Filter tasks by status"
                >
                  <option value="all">All Tasks ({counts.all})</option>
                  <option value="complete">Complete ({counts.complete})</option>
                  <option value="incomplete">Incomplete ({counts.incomplete})</option>
                </select>
              </div>
            </div>

            {/* Priority filter */}
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Priority
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFlag className="text-gray-400" aria-hidden="true" />
                </div>
                <select
                  id="priority-filter"
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  aria-label="Filter tasks by priority"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count and reset button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-blue-600">{filteredTasks.length}</span> of <span className="font-semibold">{tasks.length}</span> tasks
            </div>
            
            {(filters.search || filters.status !== 'all' || filters.priority !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
          
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FaTasks className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No tasks found</h3>
              <p className="text-gray-400 mb-4">
                {tasks.length === 0 
                  ? "No tasks have been created yet." 
                  : "No tasks match your current filters."
                }
              </p>
              {tasks.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-medium text-lg ${task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center">
                      <FaCheck 
                        className={`ml-2 ${task.status === 'complete' ? 'text-green-600' : 'text-gray-300'}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mb-3 ${task.status === 'complete' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Status badge */}
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <FaCheck className="mr-1" aria-hidden="true" />
                      {task.status === 'complete' ? 'Complete' : 'Incomplete'}
                    </span>
                    
                    {/* Priority badge */}
                    {task.priority && (
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(task.priority)}`}
                      >
                        <FaFlag className="mr-1" aria-hidden="true" />
                        {task.priority}
                      </span>
                    )}

                    {/* Progress badge */}
                    {typeof task.progress === 'number' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.progress}% Complete
                      </span>
                    )}
                  </div>
                  
                  {/* Due date and assignment info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {task.dueDate && (
                      <div className={`flex items-center ${
                        isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 
                        isDueToday(task.dueDate) ? 'text-orange-600 font-medium' : ''
                      }`}>
                        <FaCalendarAlt className="mr-1" aria-hidden="true" />
                        <span>
                          {isOverdue(task.dueDate) && '⚠️ Overdue: '}
                          {isDueToday(task.dueDate) && '🕐 Due Today: '}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                    
                    {task.assignedTo && task.assignedTo !== 'Unassigned' && (
                      <div className="flex items-center">
                        <span>Assigned to: {task.assignedTo}</span>
                      </div>
                    )}
                    
                    {task.createdAt && (
                      <div className="flex items-center">
                        <FaClock className="mr-1" aria-hidden="true" />
                        <span>Created: {formatDate(task.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default TaskFilter;

