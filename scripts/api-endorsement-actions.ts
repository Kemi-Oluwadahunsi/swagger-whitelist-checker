import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const swaggerPath = path.join(__dirname, '../dist/swagger/swagger.json');
const whitelistPath = path.join(__dirname, 'whitelist.csv');

type WhitelistEntry = {
  api: string;
  tags: string;
  method: string;
  path: string;
};

const parseCsvWhitelist = (): Promise<WhitelistEntry[]> => {
  return new Promise((resolve, reject) => {
    const entries: WhitelistEntry[] = [];

    fs.createReadStream(whitelistPath)
      .pipe(csv())
      .on('data', (data) =>
        entries.push({
          api: data.api ? data.api.trim() : '',
          tags: data.tags ? data.tags.trim() : '',
          method: data.method ? data.method.toUpperCase().trim() : '',
          path: data.path ? data.path.trim() : '',
        })
      )
      .on('end', () => resolve(entries))
      .on('error', (err) => reject(err));
  });
};

const validateSwaggerAgainstWhitelist = async () => {
  const whitelist = await parseCsvWhitelist();
  const swaggerRaw = fs.readFileSync(swaggerPath, 'utf-8');
  const swagger = JSON.parse(swaggerRaw);

  const whitelistSet = new Set(
    whitelist.map((entry) => `${entry.method.toUpperCase()} ${entry.path}`)
  );

  const violations: string[] = [];

  for (const pathKey in swagger.paths) {
    const methods = swagger.paths[pathKey];

    for (const method in methods) {
      const methodUpper = method.toUpperCase();
      const key = `${methodUpper} ${pathKey}`;
      if (!whitelistSet.has(key)) {
        violations.push(`${methodUpper} ${pathKey}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ The following Swagger endpoints are NOT in the whitelist (unauthorized endpoints):\n');
    violations.forEach((v) => console.error(` - ${v}`));
    process.exit(1);
  } else {
    console.log('✅ All Swagger endpoints are accounted for in the whitelist.');
  }
};

validateSwaggerAgainstWhitelist();
