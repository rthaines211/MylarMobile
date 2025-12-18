class MylarAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl?.replace(/\/$/, '') || '';
    this.apiKey = apiKey || '';
  }

  async request(cmd, params = {}) {
    if (!this.apiKey) {
      throw new Error('API not configured');
    }

    // Always use relative URL - both Vite (dev) and nginx (prod) proxy /api to Mylar
    const url = new URL('/api', window.location.origin);
    url.searchParams.set('cmd', cmd);
    url.searchParams.set('apikey', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success === false) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data.data !== undefined ? data.data : data;
  }

  // Comics
  getIndex() {
    return this.request('getIndex');
  }

  getComic(id) {
    return this.request('getComic', { id });
  }

  getComicInfo(id) {
    return this.request('getComicInfo', { id });
  }

  addComic(id) {
    return this.request('addComic', { id });
  }

  delComic(id) {
    return this.request('delComic', { id });
  }

  pauseComic(id) {
    return this.request('pauseComic', { id });
  }

  resumeComic(id) {
    return this.request('resumeComic', { id });
  }

  refreshComic(id) {
    return this.request('refreshComic', { id });
  }

  // Issues
  getIssueInfo(id) {
    return this.request('getIssueInfo', { id });
  }

  queueIssue(id) {
    return this.request('queueIssue', { id });
  }

  unqueueIssue(id) {
    return this.request('unqueueIssue', { id });
  }

  // Lists
  getUpcoming() {
    return this.request('getUpcoming');
  }

  getWanted() {
    return this.request('getWanted');
  }

  getHistory() {
    return this.request('getHistory');
  }

  getReadList() {
    return this.request('getReadList');
  }

  // Story Arcs
  getStoryArcs() {
    return this.request('getStoryArc');
  }

  getStoryArc(id) {
    return this.request('getStoryArc', { id });
  }

  addStoryArc(id) {
    return this.request('addStoryArc', { id });
  }

  // Search - uses the web searchit endpoint like the Mylar UI
  async searchComics(name) {
    if (!this.apiKey) {
      throw new Error('API not configured');
    }

    // Always use relative URL - nginx proxies /searchit to Mylar
    const url = new URL('/searchit', window.location.origin);
    url.searchParams.set('name', name);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.comic || data;
  }

  // Search via API
  // Response: { success: true, data: [{ name, comicyear, comicid, issues, comicimage, publisher, ... }] }
  findComic(name, { mode = 'series', type_ = 'comic' } = {}) {
    return this.request('findComic', { name, mode, type_ });
  }

  // System
  getVersion() {
    return this.request('getVersion');
  }

  forceSearch() {
    return this.request('forceSearch');
  }

  getLogs() {
    return this.request('getLogs');
  }

  clearLogs() {
    return this.request('clearLogs');
  }

  // Server management
  restart() {
    return this.request('restart');
  }

  shutdown() {
    return this.request('shutdown');
  }

  update() {
    return this.request('update');
  }

  // File operations
  recheckFiles(id) {
    return this.request('recheckFiles', { id });
  }

  // Issue status
  changeStatus(id, status) {
    return this.request('changeStatus', { id, status });
  }

  // Download issue file
  async downloadIssue(id) {
    if (!this.apiKey) {
      throw new Error('API not configured');
    }
    // Return the download URL - browser will handle the file download
    return `/api?cmd=downloadIssue&id=${id}&apikey=${this.apiKey}`;
  }

  // Cover art URL helper
  getArtUrl(id) {
    if (!this.apiKey) return '';
    // Always use relative URL - nginx proxies /api to Mylar
    return `/api?cmd=getArt&id=${id}&apikey=${this.apiKey}`;
  }
}

export default MylarAPI;
