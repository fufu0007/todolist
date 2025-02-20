interface ParsedTask {
  title: string;
  date?: Date;
  tags: string[];
  list?: string;
  priority?: 'low' | 'medium' | 'high';
}

export function parseTaskInput(input: string): ParsedTask {
  const result: ParsedTask = {
    title: input,
    tags: [],
  };

  // 解析标签 (#tag)
  const tagRegex = /#(\w+)/g;
  const tags = input.match(tagRegex);
  if (tags) {
    result.tags = tags.map(tag => tag.slice(1));
    result.title = result.title.replace(tagRegex, '').trim();
  }

  // 解析清单 (~list)
  const listRegex = /~(\w+)/;
  const listMatch = input.match(listRegex);
  if (listMatch) {
    result.list = listMatch[1];
    result.title = result.title.replace(listRegex, '').trim();
  }

  // 解析日期
  // 支持多种格式：今天、明天、周一、下周一、5/1、05-01等
  const datePatterns = {
    today: /今天|today/i,
    tomorrow: /明天|tomorrow/i,
    weekday: /周(一|二|三|四|五|六|日)/,
    nextWeek: /下周(一|二|三|四|五|六|日)/,
    date: /(\d{1,2})[/-](\d{1,2})/,
  };

  let dateStr = '';
  for (const [key, pattern] of Object.entries(datePatterns)) {
    const match = input.match(pattern);
    if (match) {
      switch (key) {
        case 'today':
          result.date = new Date();
          dateStr = match[0];
          break;
        case 'tomorrow':
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          result.date = tomorrow;
          dateStr = match[0];
          break;
        case 'weekday':
        case 'nextWeek':
          const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
          const targetDay = weekdays.indexOf(match[1]);
          const current = new Date();
          const currentDay = current.getDay();
          let daysToAdd = targetDay - currentDay;
          if (key === 'nextWeek' || daysToAdd <= 0) {
            daysToAdd += 7;
          }
          current.setDate(current.getDate() + daysToAdd);
          result.date = current;
          dateStr = match[0];
          break;
        case 'date':
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);
          const date = new Date();
          date.setMonth(month);
          date.setDate(day);
          result.date = date;
          dateStr = match[0];
          break;
      }
      break;
    }
  }

  if (dateStr) {
    result.title = result.title.replace(dateStr, '').trim();
  }

  // 解析优先级 (*priority)
  const priorityRegex = /\*(!{1,3})/;
  const priorityMatch = input.match(priorityRegex);
  if (priorityMatch) {
    switch (priorityMatch[1].length) {
      case 1:
        result.priority = 'low';
        break;
      case 2:
        result.priority = 'medium';
        break;
      case 3:
        result.priority = 'high';
        break;
    }
    result.title = result.title.replace(priorityRegex, '').trim();
  }

  return result;
} 