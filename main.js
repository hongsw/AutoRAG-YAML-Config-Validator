const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors').default;
const glob = require('glob');

function findYamlFiles(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    return files.filter(file =>
      file.endsWith('.yml') || file.endsWith('.yaml')
    ).map(file => path.join(directoryPath, file));
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
    return [];
  }
}

function loadYaml(filePath) {
  try {
    return {
      content: yaml.load(fs.readFileSync(filePath, 'utf8')),
      filePath
    };
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error);
    return null;
  }
}

function loadJsonSchema(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading JSON schema ${filePath}:`, error);
    return null;
  }
}

function validateConfig(config, schema, filePath) {
  const ajv = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });
  const validate = ajv.compile(schema);
  const valid = validate(config);

  console.log(`\nValidating: ${filePath}`);
  console.log('------------------------');

  if (!valid) {
    console.log('Validation errors:');
    const errorText = betterAjvErrors(schema, config, validate.errors, { format: 'cli', indent: 2 });
    console.log(errorText);

    // Additional detailed error reporting
    validate.errors.forEach((error, index) => {
      console.log(`\nError ${index + 1}:`);
      console.log(`Path: ${error.instancePath}`);
      console.log(`Message: ${error.message}`);
      if (error.params) {
        console.log('Additional details:');
        console.log(JSON.stringify(error.params, null, 2));
      }

      // Show the problematic part of the config
      const pathParts = error.instancePath.split('/').filter(Boolean);
      let currentObj = config;
      for (const part of pathParts) {
        currentObj = currentObj[part];
      }
      console.log('Problematic config part:');
      console.log(JSON.stringify(currentObj, null, 2));
    });
  } else {
    console.log('Configuration is valid!');
  }

  return valid;
}


function findYamlFilesGlob(directoryPath) {
  try {
    return glob.sync(path.join(directoryPath, '**/*.{yml,yaml}'));
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
    return [];
  }
}


// Main execution
function validateConfigs(schemaPath, configDir) {
  const schema = loadJsonSchema(schemaPath);
  if (!schema) {
    console.log('Failed to load schema. Please check the schema file and try again.');
    return;
  }

  const yamlFiles = findYamlFilesGlob(configDir);
  if (yamlFiles.length === 0) {
    console.log(`No YAML files found in ${configDir}`);
    return;
  }

  console.log(`Found ${yamlFiles.length} YAML file(s) to validate`);

  const results = {
    valid: [],
    invalid: []
  };

  yamlFiles.forEach(filePath => {
    const configData = loadYaml(filePath);
    if (configData) {
      const isValid = validateConfig(configData.content, schema, configData.filePath);
      if (isValid) {
        results.valid.push(configData.filePath);
      } else {
        results.invalid.push(configData.filePath);
      }
    }
  });

  // Summary
  console.log('\nValidation Summary');
  console.log('=================');
  console.log(`Total files processed: ${yamlFiles.length}`);
  console.log(`Valid configurations: ${results.valid.length}`);
  console.log(`Invalid configurations: ${results.invalid.length}`);

  if (results.invalid.length > 0) {
    console.log('\nInvalid files:');
    results.invalid.forEach(file => console.log(`- ${file}`));
  }

  return results;
}

// Usage
const schemaPath = 'config_schema.json';
const configDir = 'config';

console.log('Starting configuration validation...');
validateConfigs(schemaPath, configDir);
