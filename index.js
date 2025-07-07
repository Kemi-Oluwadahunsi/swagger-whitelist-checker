const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Get inputs
const swaggerPath = core.getInput('swagger-path');
const whitelistPath = core.getInput('whitelist-path');
const buildCommand = core.getInput('build-command');

// Whitelist entry type
const parseCsvWhitelist = (whitelistPath) => {
  return new Promise((resolve, reject) => {
    const entries = [];

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

const validateSwaggerAgainstWhitelist = async (swaggerPath, whitelistPath) => {
  try {
    // Check if files exist
    if (!fs.existsSync(swaggerPath)) {
      core.setFailed(`Swagger file not found at: ${swaggerPath}`);
      return;
    }

    if (!fs.existsSync(whitelistPath)) {
      core.setFailed(`Whitelist file not found at: ${whitelistPath}`);
      return;
    }

    const whitelist = await parseCsvWhitelist(whitelistPath);
    const swaggerRaw = fs.readFileSync(swaggerPath, 'utf-8');
    const swagger = JSON.parse(swaggerRaw);

    const whitelistSet = new Set(
      whitelist.map((entry) => `${entry.method.toUpperCase()} ${entry.path}`)
    );

    const violations = [];

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
      core.setFailed(`❌ The following Swagger endpoints are NOT in the whitelist (unauthorized endpoints):\n${violations.map(v => ` - ${v}`).join('\n')}`);
    } else {
      core.notice('✅ All Swagger endpoints are accounted for in the whitelist.');
    }
  } catch (error) {
    core.setFailed(`Error during validation: ${error.message}`);
  }
};

const main = async () => {
  try {
    // Run build command if provided
    if (buildCommand) {
      core.info(`Running build command: ${buildCommand}`);
      execSync(buildCommand, { stdio: 'inherit' });
    }

    // Validate swagger against whitelist
    await validateSwaggerAgainstWhitelist(swaggerPath, whitelistPath);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
};

main(); 