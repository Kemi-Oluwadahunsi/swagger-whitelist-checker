# Project-Specific Whitelist URLs

This document provides the correct whitelist URLs for different project types.

## Available Whitelists

### 1. General API Whitelist

**URL**: `https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelist.csv`
**Use for**: General API projects with standard endpoints

### 2. Authentication API Whitelist

**URL**: `https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelistAuth.csv`
**Use for**: Authentication and authorization services

### 3. Java Project Whitelist

**URL**: `https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/java-whitelist.csv`
**Use for**: Java/Spring Boot projects

## Usage Examples

### For Java Projects

```yaml
- name: Validate Java API
  uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
  with:
    swagger-file: "target/openapi.json"
    whitelist-url: "https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/java-whitelist.csv"
```

### For Authentication Services

```yaml
- name: Validate Auth API
  uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
  with:
    swagger-file: "swagger.json"
    whitelist-url: "https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelistAuth.csv"
```

### For General API Projects

```yaml
- name: Validate General API
  uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
  with:
    swagger-file: "swagger.json"
    whitelist-url: "https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelist.csv"
```

## Adding New Project Types

To add a new project type:

1. Create a new whitelist CSV file in the `scripts/` directory
2. Add the URL to this documentation
3. Update the main README with usage examples
