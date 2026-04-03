import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// ==================== Chat Parser ====================

export const parseChat = async (file: File, platform: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('platform', platform);
  const { data } = await api.post('/chat/parse', formData);
  return data;
};

// ==================== BookSpecs ====================

export const getBookSpecs = async () => {
  const { data } = await api.get('/book-specs');
  return data;
};

export const getBookSpec = async (uid: string) => {
  const { data } = await api.get(`/book-specs/${uid}`);
  return data;
};

// ==================== Templates ====================

export const getTemplates = async (params?: {
  bookSpecUid?: string;
  templateKind?: string;
  category?: string;
}) => {
  const { data } = await api.get('/templates', { params });
  return data;
};

export const getTemplate = async (uid: string) => {
  const { data } = await api.get(`/templates/${uid}`);
  return data;
};

// ==================== Books ====================

export const listBooks = async (params?: { status?: string; limit?: number; offset?: number }) => {
  const { data } = await api.get('/books', { params });
  return data;
};

export const createBook = async (title: string, bookSpecUid: string) => {
  const { data } = await api.post('/books', { title, bookSpecUid });
  return data;
};

export const getBook = async (bookUid: string) => {
  const { data } = await api.get(`/books/${bookUid}`);
  return data;
};

export const deleteBook = async (bookUid: string) => {
  const { data } = await api.delete(`/books/${bookUid}`);
  return data;
};

// ==================== Photos ====================

export const uploadPhoto = async (bookUid: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/books/${bookUid}/photos`, formData);
  return data;
};

export const listPhotos = async (bookUid: string) => {
  const { data } = await api.get(`/books/${bookUid}/photos`);
  return data;
};

// ==================== Cover ====================

export const createCover = async (
  bookUid: string,
  templateUid: string,
  parameters: Record<string, unknown>,
  files?: Record<string, File>
) => {
  const formData = new FormData();
  formData.append('templateUid', templateUid);
  formData.append('parameters', JSON.stringify(parameters));
  if (files) {
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });
  }
  const { data } = await api.post(`/books/${bookUid}/cover`, formData);
  return data;
};

// ==================== Contents ====================

export const addContent = async (
  bookUid: string,
  templateUid: string,
  parameters: Record<string, unknown>,
  breakBefore?: string,
  files?: Record<string, File>
) => {
  const formData = new FormData();
  formData.append('templateUid', templateUid);
  formData.append('parameters', JSON.stringify(parameters));
  if (files) {
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });
  }
  const { data } = await api.post(`/books/${bookUid}/contents`, formData, {
    params: { breakBefore: breakBefore || 'page' },
  });
  return data;
};

export const clearContents = async (bookUid: string) => {
  const { data } = await api.delete(`/books/${bookUid}/contents`);
  return data;
};

// ==================== Finalize ====================

export const finalizeBook = async (bookUid: string) => {
  const { data } = await api.post(`/books/${bookUid}/finalize`);
  return data;
};

// ==================== Orders ====================

export const estimateOrder = async (items: { bookUid: string; quantity: number }[]) => {
  const { data } = await api.post('/orders/estimate', { items });
  return data;
};

export const createOrder = async (
  items: { bookUid: string; quantity: number }[],
  shipping: {
    recipientName: string;
    recipientPhone: string;
    postalCode: string;
    address1: string;
    address2?: string;
    memo?: string;
  },
  externalRef?: string
) => {
  const { data } = await api.post('/orders', { items, shipping, externalRef });
  return data;
};

export const listOrders = async (params?: { status?: number; limit?: number; offset?: number }) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

export const getOrder = async (orderUid: string) => {
  const { data } = await api.get(`/orders/${orderUid}`);
  return data;
};

export const cancelOrder = async (orderUid: string, reason: string) => {
  const { data } = await api.post(`/orders/${orderUid}/cancel`, { cancelReason: reason });
  return data;
};

// ==================== Credits ====================

export const getCredits = async () => {
  const { data } = await api.get('/credits');
  return data;
};

export default api;
