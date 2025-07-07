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
export declare function validateSwaggerAgainstWhitelist(swaggerFilePath: string, whitelistUrl: string): Promise<ValidationResult>;
//# sourceMappingURL=validator.d.ts.map