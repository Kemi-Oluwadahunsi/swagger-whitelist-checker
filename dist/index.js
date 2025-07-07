"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const validator_1 = require("./validator");
async function run() {
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
        const result = await (0, validator_1.validateSwaggerAgainstWhitelist)(swaggerFile, whitelistUrl);
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
            }
            else {
                core.info('⚠️  Swagger validation completed with violations (non-fatal)');
            }
        }
        else {
            core.info('✅ All Swagger endpoints are authorized in the whitelist');
        }
    }
    catch (error) {
        core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
run();
//# sourceMappingURL=index.js.map