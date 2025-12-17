import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfig } from '../context/ConfigContext';

// Query keys
export const queryKeys = {
  comics: ['comics'],
  comic: (id) => ['comic', id],
  comicInfo: (id) => ['comicInfo', id],
  upcoming: ['upcoming'],
  wanted: ['wanted'],
  history: ['history'],
  readList: ['readList'],
  storyArcs: ['storyArcs'],
  storyArc: (id) => ['storyArc', id],
  search: (query) => ['search', query],
  version: ['version'],
  weeklyPull: (week, year) => ['weeklyPull', week, year],
  weeklyWeeks: ['weeklyWeeks'],
};

// Comics list
export function useComics() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.comics,
    queryFn: () => api.getIndex(),
    enabled: isConfigured,
  });
}

// Single comic with issues
export function useComic(id) {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.comic(id),
    queryFn: () => api.getComic(id),
    enabled: isConfigured && !!id,
  });
}

// Comic metadata
export function useComicInfo(id) {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.comicInfo(id),
    queryFn: () => api.getComicInfo(id),
    enabled: isConfigured && !!id,
  });
}

// Upcoming releases
export function useUpcoming() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.upcoming,
    queryFn: () => api.getUpcoming(),
    enabled: isConfigured,
  });
}

// Wanted/missing issues
export function useWanted() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.wanted,
    queryFn: () => api.getWanted(),
    enabled: isConfigured,
  });
}

// Download history
export function useHistory() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.history,
    queryFn: () => api.getHistory(),
    enabled: isConfigured,
  });
}

// Read list
export function useReadList() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.readList,
    queryFn: () => api.getReadList(),
    enabled: isConfigured,
  });
}

// Story arcs list
export function useStoryArcs() {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.storyArcs,
    queryFn: () => api.getStoryArcs(),
    enabled: isConfigured,
  });
}

// Single story arc with issues
export function useStoryArc(id) {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.storyArc(id),
    queryFn: () => api.getStoryArc(id),
    enabled: isConfigured && !!id,
  });
}

// Batch queue multiple issues
export function useBatchQueueIssues() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueIds) => {
      // Queue all issues in parallel
      const results = await Promise.allSettled(
        issueIds.map((id) => api.queueIssue(id))
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { succeeded, failed, total: issueIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wanted });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming });
      queryClient.invalidateQueries({ queryKey: ['weeklyPull'] });
    },
  });
}

// Search comics via API
export function useSearchComics(query) {
  const { api, isConfigured } = useConfig();

  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => api.findComic(query),
    enabled: isConfigured && !!query && query.length >= 2,
  });
}

// Add comic mutation
export function useAddComic() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.addComic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comics });
      // Invalidate weekly pull list - status may change after Mylar refreshes
      queryClient.invalidateQueries({ queryKey: ['weeklyPull'] });
    },
  });
}

// Delete comic mutation
export function useDeleteComic() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delComic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comics });
    },
  });
}

// Pause comic mutation
export function usePauseComic() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.pauseComic(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comic(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.comics });
    },
  });
}

// Resume comic mutation
export function useResumeComic() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.resumeComic(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comic(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.comics });
    },
  });
}

// Refresh comic mutation
export function useRefreshComic() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.refreshComic(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comic(id) });
    },
  });
}

// Queue issue mutation
export function useQueueIssue() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.queueIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wanted });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming });
      // Also invalidate weekly pull list to reflect status change
      queryClient.invalidateQueries({ queryKey: ['weeklyPull'] });
    },
  });
}

// Unqueue issue mutation
export function useUnqueueIssue() {
  const { api } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.unqueueIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wanted });
    },
  });
}

// Force search mutation
export function useForceSearch() {
  const { api } = useConfig();

  return useMutation({
    mutationFn: () => api.forceSearch(),
  });
}

// Backend URL - always use relative URL (both Vite and nginx proxy /backend)
function getBackendUrl() {
  return '/backend';
}

// Weekly pull list from local database
export function useWeeklyPull(weekNumber, year, status = 'all') {
  const { config } = useConfig();
  const { mylarDbPath } = config;
  const backendUrl = getBackendUrl();

  return useQuery({
    queryKey: queryKeys.weeklyPull(weekNumber, year),
    queryFn: async () => {
      const params = new URLSearchParams({
        dbPath: mylarDbPath,
        status,
      });
      if (weekNumber) params.set('weekNumber', weekNumber);
      if (year) params.set('year', year);

      const response = await fetch(`${backendUrl}/weekly?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch weekly pull list');
      }
      return data.data;
    },
    enabled: !!mylarDbPath,
  });
}

// Get available weeks
export function useWeeklyWeeks() {
  const { config } = useConfig();
  const { mylarDbPath } = config;
  const backendUrl = getBackendUrl();

  return useQuery({
    queryKey: queryKeys.weeklyWeeks,
    queryFn: async () => {
      const params = new URLSearchParams({ dbPath: mylarDbPath });
      const response = await fetch(`${backendUrl}/weekly/weeks?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch weeks');
      }
      return data.data;
    },
    enabled: !!mylarDbPath,
  });
}
