import fs from 'fs/promises';
import path from 'path';

const FILE_PATH = path.join(__dirname, '../urls.json');

interface URLMapping {
  [code: string]: string;
}

export async function saveUrl(code: string, url: string) {
  const data = await loadUrls();
  data[code] = url;
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

export async function getUrl(code: string): Promise<string | null> {
  const data = await loadUrls();
  console.log('Current urls.json content:', data); 
  console.log('Looking for code:', code);          
  return data[code] || null;
}

async function loadUrls(): Promise<URLMapping> {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    console.log('Loaded URLs from file:', parsed);  
    return parsed;
  } catch {
    console.log('urls.json is empty or missing');
    return {};
  }
}
