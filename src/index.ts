import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { validateSwaggerAgainstWhitelist } from './validator';

async function run(): Promise<void> {
  try {
    // Get inputs
    const swaggerFile = core.getInput('swagger-file', { required: true });
    const whitelistUrl = core.getInput('whitelist-url', { required: true });
    const failOnViolations = core.getInput('fail-on-violations', { required: false }) === 'true';

    // Validate file exists
    if (!fs.existsSync(swaggerFile)) {
      core.setFailed(`Swagger file not found: ${swaggerFile}`);
      return;
    }

    core.info(`🔍 Validating Swagger file: ${swaggerFile}`);
    core.info(`📋 Using whitelist from: ${whitelistUrl}`);

    // Run validation
    const result = await validateSwaggerAgainstWhitelist(swaggerFile, whitelistUrl);

    // Set outputs
    core.setOutput('violations', JSON.stringify(result.violations));
    core.setOutput('is-valid', result.isValid.toString());

    if (result.violations.length > 0) {
      core.warning(`Found ${result.violations.length} unauthorized endpoints:`);
      result.violations.forEach(violation => {
        core.warning(`  - ${violation}`);
      });

      if (failOnViolations) {
        core.setFailed('❌ Swagger validation failed - unauthorized endpoints found');
      } else {
        core.info('⚠️  Swagger validation completed with violations (non-fatal)');
      }
    } else {
      core.info('✅ All Swagger endpoints are authorized in the whitelist');
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

run(); 