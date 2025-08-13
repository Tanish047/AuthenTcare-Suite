import { ipcMain } from 'electron';
import { z } from 'zod';
import { fetchPageContent } from '../../services/webCrawler.js';

const UrlSchema = z.string().url();

/**
 * IPC handler for fetching web page content.
 * Validates the URL and returns structured data from the web crawler service.
 */
ipcMain.handle('webCrawler:fetch', async (_event, url) => {
  const validatedUrl = UrlSchema.parse(url);
  const result = await fetchPageContent(validatedUrl);
  return result;
});
