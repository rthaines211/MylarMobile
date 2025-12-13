class MylarAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl?.replace(/\/$/, '') || '';
    this.apiKey = apiKey || '';
  }

  async request(cmd, params = {}) {
    if (!this.apiKey) {
      throw new Error('API not configured');
    }

    // In development, use relative URL so Vite proxy handles CORS
    // In production, use the configured baseUrl
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '' : this.baseUrl;

    if (!isDev && !this.baseUrl) {
      throw new Error('Server URL not configured');
    }

    const url = new URL(`${baseUrl}/api`, window.location.origin);
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

  // Search - uses the web searchit endpoint like the Mylar UI
  async searchComics(name) {
    if (!this.apiKey) {
      throw new Error('API not configured');
    }

    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '' : this.baseUrl;

    if (!isDev && !this.baseUrl) {
      throw new Error('Server URL not configured');
    }

    const url = new URL(`${baseUrl}/searchit`, window.location.origin);
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

  // Cover art URL helper
  getArtUrl(id) {
    if (!this.apiKey) return '';
    // In development, use relative URL for proxy
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '' : this.baseUrl;
    if (!isDev && !this.baseUrl) return '';
    return `${baseUrl}/api?cmd=getArt&id=${id}&apikey=${this.apiKey}`;
  }
}

export default MylarAPI;
