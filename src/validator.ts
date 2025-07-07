import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import csv from 'csv-parser';

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  totalEndpoints: number;
  authorizedEndpoints: number;
  unauthorizedEndpoints: number;
}

export interface WhitelistEntry {
  api: string;
  tags: string;
  method: string;
  path: string;
}

async function downloadWhitelist(url: string): Promise<WhitelistEntry[]> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download whitelist: HTTP ${res.statusCode}`));
        return;
      }

      const entries: WhitelistEntry[] = [];
      
      res.pipe(csv())
        .on('data', (data) => {
          entries.push({
            api: data.api ? data.api.trim() : '',
            tags: data.tags ? data.tags.trim() : '',
            method: data.method ? data.method.toUpperCase().trim() : '',
            path: data.path ? data.path.trim() : '',
          });
        })
        .on('end', () => resolve(entries))
        .on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

function parseSwaggerFile(filePath: string): any {
  const swaggerRaw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(swaggerRaw);
}

export async function validateSwaggerAgainstWhitelist(
  swaggerFilePath: string, 
  whitelistUrl: string
): Promise<ValidationResult> {
  try {
    // Download and parse whitelist
    const whitelist = await downloadWhitelist(whitelistUrl);
    const whitelistSet = new Set(
      whitelist.map((entry) => `${entry.method.toUpperCase()} ${entry.path}`)
    );

    // Parse Swagger file
    const swagger = parseSwaggerFile(swaggerFilePath);
    const violations: string[] = [];
    let totalEndpoints = 0;
    let authorizedEndpoints = 0;

    // Validate each endpoint
    for (const pathKey in swagger.paths) {
      const methods = swagger.paths[pathKey];

      for (const method in methods) {
        const methodUpper = method.toUpperCase();
        const key = `${methodUpper} ${pathKey}`;
        totalEndpoints++;

        if (!whitelistSet.has(key)) {
          violations.push(key);
        } else {
          authorizedEndpoints++;
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      totalEndpoints,
      authorizedEndpoints,
      unauthorizedEndpoints: violations.length
    };

  } catch (error) {
    throw new Error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 