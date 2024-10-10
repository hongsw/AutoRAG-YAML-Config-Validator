const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors').default;

function loadYaml(filePath) {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
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

function validateConfig(config, schema) {
  const ajv = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });
  const validate = ajv.compile(schema);
  const valid = validate(config);

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

// Main execution
const schema = loadJsonSchema('config_schema.json');
const config = loadYaml('config.yaml');

if (schema && config) {
  console.log('Validating configuration...');
  const isValid = validateConfig(config, schema);
  
  if (isValid) {
    console.log('Config is valid. Proceeding with further processing...');
    // Here you can add any additional processing of the valid config
  } else {
    console.log('Config is invalid. Please correct the errors and try again.');
  }
} else {
  console.log('Failed to load schema or config. Please check the files and try again.');
}