# Swagger Whitelist Validator

A GitHub Action that validates Swagger/OpenAPI endpoints against a centralized whitelist to ensure API security and compliance.

## 🎯 Purpose

This action serves as a centralized validation service that other repositories can use to validate their Swagger files against a predefined whitelist of authorized endpoints. It helps maintain API security by ensuring only approved endpoints are deployed.

## 🚀 Usage

### Basic Usage

```yaml
name: Validate Swagger
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate Swagger against whitelist
        uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
        with:
          swagger-file: 'swagger.json'
          whitelist-url: 'https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelist.csv'
          fail-on-violations: 'true'
```

### Advanced Usage

```yaml
name: API Validation
on: 
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate Swagger endpoints
        id: validate
        uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
        with:
          swagger-file: 'api/swagger.json'
          whitelist-url: 'https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelist.csv'
          fail-on-violations: 'false'
      
      - name: Report violations
        if: steps.validate.outputs.is-valid == 'false'
        run: |
          echo "Found violations:"
          echo '${{ steps.validate.outputs.violations }}'
```

### Legacy Parameter Support

If you're using the legacy parameter names, the action will still work but will show deprecation warnings:

```yaml
# ❌ Legacy usage (deprecated)
- name: Run Centralized Whitelist Check
  uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
  with:
    swagger-path: 'dist/swagger/swagger.json'  # Use swagger-file instead
    build-command: 'npm run build'             # Not used in current version

# ✅ Correct usage
- name: Run Centralized Whitelist Check
  uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
  with:
    swagger-file: 'dist/swagger/swagger.json'
    fail-on-violations: 'true'
```

## 📋 Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `swagger-file` | Path to the Swagger/OpenAPI JSON file to validate | No | `swagger.json` |
| `swagger-path` | **Legacy parameter** - Use `swagger-file` instead | No | - |
| `whitelist-url` | URL to the centralized whitelist CSV file | **Yes** | - |
| `fail-on-violations` | Whether to fail the action if violations are found | No | `true` |
| `build-command` | **Legacy parameter** - Not used in current version | No | - |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `violations` | JSON array of unauthorized endpoints found |
| `is-valid` | Boolean indicating if validation passed |

## 📊 Whitelist Format

The whitelist should be a CSV file with the following columns:

```csv
api,tags,method,path
CreateProduct,Product,POST,/products
GetProduct,Product,GET,/products/{productId}
CreateUser,User,POST,/users
GetUsers,User,GET,/users
```

## 🎯 Project-Specific Whitelists

Different project types have different whitelist URLs:

### Java Projects
```yaml
whitelist-url: 'https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/java-whitelist.csv'
```

### Authentication Services
```yaml
whitelist-url: 'https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelistAuth.csv'
```

### General API Projects
```yaml
whitelist-url: 'https://raw.githubusercontent.com/Kemi-Oluwadahunsi/swagger-whitelist-checker/main/scripts/whitelist.csv'
```

See [scripts/project-whitelists.md](scripts/project-whitelists.md) for complete documentation.

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Test locally
npm run test
```

### Adding New Endpoints to Whitelist

1. Edit `scripts/whitelist.csv`
2. Add new rows in the format: `api,tags,method,path`
3. Commit and push changes
4. Create a new release tag

## 📝 Example Workflow

Here's how other repositories can use this action:

```yaml
name: API Security Check
on: [push, pull_request]

jobs:
  security-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate API endpoints
        uses: Kemi-Oluwadahunsi/swagger-whitelist-checker@v1.1.0
        with:
          swagger-file: 'docs/api/swagger.json'
          fail-on-violations: 'true'
```

## 🛡️ Security Benefits

- **Centralized Control**: All API endpoints are validated against a single source of truth
- **Automated Compliance**: Ensures no unauthorized endpoints are deployed
- **Audit Trail**: Provides clear reporting of violations
- **Flexible Configuration**: Can be configured to fail builds or just report violations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 