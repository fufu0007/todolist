import { memo } from 'react';
import { 
  Filter, SortAsc, SortDesc, Search, 
  AlertCircle, Flag, ListTodo
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed' | 'deleted';
type SortType = 'createdAt' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

interface TodoListFiltersProps {
  filter: FilterType;
  sort: SortType;
  sortDirection: SortDirection;
  searchQuery: string;
  selectedTags: string[];
  selectedPriority: 'low' | 'medium' | 'high' | 'all';
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onSearchChange: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
  onPriorityChange: (priority: 'low' | 'medium' | 'high' | 'all') => void;
}

const TodoListFilters = ({
  filter,
  sort,
  sortDirection,
  searchQuery,
  selectedTags,
  selectedPriority,
  onFilterChange,
  onSortChange,
  onSortDirectionChange,
  onSearchChange,
  onTagsChange,
  onPriorityChange
}: TodoListFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索任务..."
          className="w-48 px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-400" />
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterType)}
          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部</option>
          <option value="active">进行中</option>
          <option value="completed">已完成</option>
          <option value="deleted">已删除</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        {sortDirection === 'asc' ? (
          <SortAsc size={20} className="text-gray-400" />
        ) : (
          <SortDesc size={20} className="text-gray-400" />
        )}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">创建时间</option>
          <option value="priority">优先级</option>
          <option value="dueDate">截止日期</option>
        </select>
        <button
          onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {sortDirection === 'asc' ? <SortDesc size={20} /> : <SortAsc size={20} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-gray-400" />
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value as 'low' | 'medium' | 'high' | 'all')}
          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有优先级</option>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Flag size={20} className="text-gray-400" />
        <select
          multiple
          value={selectedTags}
          onChange={(e) => onTagsChange(Array.from(e.target.selectedOptions, option => option.value))}
          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="work">工作</option>
          <option value="personal">个人</option>
          <option value="shopping">购物</option>
          <option value="health">健康</option>
          <option value="study">学习</option>
        </select>
      </div>
    </div>
  );
};

export default memo(TodoListFilters); 