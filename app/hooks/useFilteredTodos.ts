import { useMemo } from 'react';
import type { Todo } from '../types/todo';

type FilterType = 'all' | 'active' | 'completed' | 'deleted';
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
    switch (filter) {
      case 'active':
        filteredTodos = filteredTodos.filter(todo => !todo.completed && !todo.deleted);
        break;
      case 'completed':
        filteredTodos = filteredTodos.filter(todo => todo.completed && !todo.deleted);
        break;
      case 'deleted':
        filteredTodos = filteredTodos.filter(todo => todo.deleted);
        break;
      // 'all' 不需要过滤，但我们仍然要排除已删除的项目
      default:
        filteredTodos = filteredTodos.filter(todo => !todo.deleted);
    }

    // 应用搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTodos = filteredTodos.filter(todo =>
        todo.title.toLowerCase().includes(query)
      );
    }

    // 应用标签过滤
    if (selectedTags.length > 0) {
      filteredTodos = filteredTodos.filter(todo =>
        todo.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // 应用优先级过滤
    if (selectedPriority !== 'all') {
      filteredTodos = filteredTodos.filter(todo =>
        todo.priority === selectedPriority
      );
    }

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