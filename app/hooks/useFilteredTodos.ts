import { useMemo, useCallback } from 'react';
import type { Todo } from '../types/todo';

type FilterType = 'all' | 'active' | 'completed' | 'deleted' | 'today';
type SortType = 'createdAt' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

interface UseFilteredTodosParams {
  todos: Todo[];
  filter: FilterType;
  sort: SortType;
  sortDirection: SortDirection;
  searchQuery: string;
  selectedTags: string[];
  selectedPriority: 'low' | 'medium' | 'high' | 'all';
}

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

export const useFilteredTodos = ({
  todos,
  filter,
  sort,
  sortDirection,
  searchQuery,
  selectedTags,
  selectedPriority
}: UseFilteredTodosParams) => {
  return useMemo(() => {
    let filteredTodos = [...todos];

    // 应用过滤器
    const filterTodos = useCallback((todos: Todo[]) => {
      // 根据过滤条件筛选
      let filtered = todos.filter(todo => {
        if (filter === 'all') return !todo.deleted;
        if (filter === 'active') return !todo.deleted && !todo.completed;
        if (filter === 'completed') return !todo.deleted && todo.completed;
        if (filter === 'deleted') return todo.deleted;
        if (filter === 'today') {
          const today = new Date().setHours(0, 0, 0, 0);
          const todoDate = new Date(todo.createdAt).setHours(0, 0, 0, 0);
          return todoDate === today && !todo.deleted;
        }
        return true;
      });

      // 应用搜索
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(todo =>
          todo.title.toLowerCase().includes(query)
        );
      }

      // 应用标签过滤
      if (selectedTags.length > 0) {
        filtered = filtered.filter(todo =>
          todo.tags?.some(tag => selectedTags.includes(tag))
        );
      }

      // 应用优先级过滤
      if (selectedPriority !== 'all') {
        filtered = filtered.filter(todo =>
          todo.priority === selectedPriority
        );
      }

      return filtered;
    }, [filter, searchQuery, selectedTags, selectedPriority]);

    filteredTodos = filterTodos(filteredTodos);

    // 应用排序
    filteredTodos.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filteredTodos;
  }, [todos, filter, sort, sortDirection, searchQuery, selectedTags, selectedPriority]);
}; 