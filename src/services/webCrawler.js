import fetch from 'node-fetch';
import { load } from 'cheerio';

export async function fetchPageContent(url) {
  if (!url) {
    throw new Error('URL is required');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const $ = load(html);
  const title = $('title').text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 1500);
  return { title, description, text };
}