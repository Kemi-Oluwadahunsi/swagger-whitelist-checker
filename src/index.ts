import * as core from '@actions/core';
import * as fs from 'fs';
import { validateSwaggerAgainstWhitelist } from './validator';

async function run(): Promise<void> {
  try {
    // Get inputs with legacy parameter support
    let swaggerFile = core.getInput('swagger-file');
    const swaggerPath = core.getInput('swagger-path');
    
    // Handle legacy parameter name
    if (!swaggerFile && swaggerPath) {
      swaggerFile = swaggerPath;
      core.warning('⚠️  The "swagger-path" parameter is deprecated. Please use "swagger-file" instead.');
    }
    
    // Use default if neither is provided
    if (!swaggerFile) {
      swaggerFile = 'swagger.json';
      core.info('📁 Using default swagger file path: swagger.json');
    }

    const whitelistUrl = core.getInput('whitelist-url');
    const failOnViolations = core.getInput('fail-on-violations', { required: false }) === 'true';
    
    // Handle legacy build-command parameter
    const buildCommand = core.getInput('build-command');
    if (buildCommand) {
      core.warning('⚠️  The "build-command" parameter is deprecated and not used in this version.');
    }

    // Validate file exists
    if (!fs.existsSync(swaggerFile)) {
      core.setFailed(`❌ Swagger file not found: ${swaggerFile}`);
      core.info('💡 Please check that:');
      core.info('   1. The file path is correct');
      core.info('   2. The file exists in your repository');
      core.info('   3. The path is relative to the repository root');
      core.info('');
      core.info('📋 Available files in current directory:');
      try {
        const files = fs.readdirSync('.');
        files.forEach(file => {
          if (file.endsWith('.json')) {
            core.info(`   - ${file}`);
          }
        });
      } catch (err) {
        core.info('   (Could not list directory contents)');
      }
      return;
    }

    core.info(`🔍 Validating Swagger file: ${swaggerFile}`);
    core.info(`📋 Using whitelist from: ${whitelistUrl}`);

    // Run validation
    const result = await validateSwaggerAgainstWhitelist(swaggerFile, whitelistUrl);

    // Set outputs
    core.setOutput('violations', JSON.stringify(result.violations));
    core.setOutput('is-valid', result.isValid.toString());

    core.info(`📊 Validation Summary:`);
    core.info(`   Total endpoints: ${result.totalEndpoints}`);
    core.info(`   Authorized endpoints: ${result.authorizedEndpoints}`);
    core.info(`   Unauthorized endpoints: ${result.unauthorizedEndpoints}`);

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