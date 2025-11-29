import { Event, EventFilter } from './types';

export class FilterEventsUsecase {
  execute(allEvents: Event[], filter: EventFilter): Event[] {
    let filtered = [...allEvents];

    // Filter by group visibility
    if (filter.visibleGroupIds && filter.visibleGroupIds.length > 0) {
      filtered = filtered.filter(event => 
        filter.visibleGroupIds!.includes(event.groupId)
      );
    }

    // Filter by keyword (search in name or description)
    if (filter.searchKeyword && filter.searchKeyword.trim()) {
      const keyword = filter.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword)
      );
    }

    // Filter by date range (optional)
    if (filter.dateRange) {
      filtered = filtered.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const rangeStart = new Date(filter.dateRange!.start);
        const rangeEnd = new Date(filter.dateRange!.end);
        
        // Event overlaps with the range
        return eventStart <= rangeEnd && eventEnd >= rangeStart;
      });
    }

    return filtered;
  }
}
