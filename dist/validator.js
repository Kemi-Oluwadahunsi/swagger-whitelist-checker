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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSwaggerAgainstWhitelist = validateSwaggerAgainstWhitelist;
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const csv_parser_1 = __importDefault(require("csv-parser"));
async function downloadWhitelist(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download whitelist: HTTP ${res.statusCode}`));
                return;
            }
            const entries = [];
            res.pipe((0, csv_parser_1.default)())
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
function parseSwaggerFile(filePath) {
    const swaggerRaw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(swaggerRaw);
}
async function validateSwaggerAgainstWhitelist(swaggerFilePath, whitelistUrl) {
    try {
        // Download and parse whitelist
        const whitelist = await downloadWhitelist(whitelistUrl);
        const whitelistSet = new Set(whitelist.map((entry) => `${entry.method.toUpperCase()} ${entry.path}`));
        // Parse Swagger file
        const swagger = parseSwaggerFile(swaggerFilePath);
        const violations = [];
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
                }
                else {
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
    }
    catch (error) {
        throw new Error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=validator.js.map