#  AutoRAG YAML Config Validator

## Why Node.js?

While we initially explored both Node.js and Python implementations, we've found that Node.js offers significant advantages for this project:

1. **Multiple Error Reporting**: The Node.js version, using Ajv and better-ajv-errors, can report multiple validation errors in a single run. This is crucial for efficiently identifying and fixing all issues in complex configurations.

2. **Detailed Error Information**: The Node.js implementation provides more comprehensive error details, including the exact location, context, and suggestions for fixing issues.

3. **Better Schema Support**: Ajv in Node.js offers more extensive JSON Schema support, allowing for more complex and fine-grained validation rules.

4. **Performance**: For large configuration files, Node.js typically offers better performance in parsing and validating JSON and YAML.

5. **Ecosystem**: The Node.js ecosystem has more mature and actively maintained libraries for JSON Schema validation and error reporting.

Given these advantages, we recommend using the Node.js version of the validator for the best experience and most comprehensive validation results.

## Current Status

This project provides a Node.js script to validate YAML configuration files against a JSON schema. It uses Ajv for validation, js-yaml for YAML parsing, and better-ajv-errors for detailed error reporting.

### Example Error Output (Node.js Version)

```
node validate.js
Validating configuration...
Validation errors:
TYPE must be number

  216 |             {
  217 |               "module_type": "recency_filter",
> 218 |               "threshold": "2015-01-01T00:00:00.000Z"
      |                            ^^^^^^^^^^^^^^^^^^^^^^^^^^ 👈🏽  type must be number
  219 |             },
  220 |             {
  221 |               "module_type": "threshold_cutoff",

Error 1:
Path: /node_lines/1/nodes/3/modules/3/threshold
Message: must be number
Additional details:
{
  "type": "number"
}
Problematic config part:
"2015-01-01T00:00:00.000Z"

Error 2:
Path: /node_lines/2/nodes/1/modules/1
Message: must have required property 'module_type'
Additional details:
{
  "missingProperty": "module_type"
}
Problematic config part:
{
  "module_type1": "openai_llm",
  "llm": "gpt-3.5-turbo",
  "temperature": 0.8
}
Config is invalid. Please correct the errors and try again.
```

## Purpose

The main objectives of this validator are:

1. Verify the structural correctness of YAML configuration files against a JSON schema
2. Identify multiple issues in a single run, including type mismatches and missing required fields
3. Provide detailed error information with exact locations and context
4. Facilitate efficient correction of configuration files

## Usage

1. Install required packages:

   ```sh
   npm install js-yaml ajv better-ajv-errors
   ```

2. Place the JSON schema file (`config_schema.json`) and YAML configuration file (`config.yaml`) in the project root.

3. Run the validation script:

   ```sh
   node validate.js
   ```

4. The script will validate the configuration file and output the results:
   - If valid: Outputs "Configuration is valid!" message
   - If invalid: Outputs detailed information for all encountered errors

## How to Resolve Errors

1. Run the validation script and carefully read all error messages.
2. For each error, locate the problematic part in your configuration file using the specified path.
3. Modify the configuration file to address all reported errors.
4. Re-run the validation script to ensure all issues have been resolved.

## Future Plans

- Implement custom validation rules
- Develop a web-based interface for easier interaction
- Integrate with CI/CD pipelines for automated config validation
- Explore options for generating configuration templates based on the schema

## Contributing

Contributions to improve the validator are welcome. Please submit pull requests or open issues to discuss potential improvements or report bugs.


## Python validate output sample
```sh
✗ python validate.py
Validating configuration...
Validation errors:
Path: node_lines -> 1 -> nodes -> 3 -> modules -> 3 -> threshold
Message: datetime.date(2015, 1, 1) is not of type 'number'

Problematic config part:
Traceback (most recent call last):
  File "/Users/martin/Development/autorag-saas/yaml-schema/validate.py", line 24, in validate_config
    validate(instance=config, schema=schema)
  File "/Users/martin/.pyenv/versions/3.10.13/lib/python3.10/site-packages/jsonschema/validators.py", line 1307, in validate
    raise error
jsonschema.exceptions.ValidationError: datetime.date(2015, 1, 1) is not of type 'number'

Failed validating 'type' in schema['properties']['node_lines']['items']['properties']['nodes']['items']['properties']['modules']['items']['properties']['threshold']:
    {'type': 'number'}

On instance['node_lines'][1]['nodes'][3]['modules'][3]['threshold']:
    datetime.date(2015, 1, 1)

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/Users/martin/Development/autorag-saas/yaml-schema/validate.py", line 51, in <module>
    is_valid = validate_config(config, schema)
  File "/Users/martin/Development/autorag-saas/yaml-schema/validate.py", line 41, in validate_config
    print(json.dumps(current_obj, indent=2))
  File "/Users/martin/.pyenv/versions/3.10.13/lib/python3.10/json/__init__.py", line 238, in dumps
    **kw).encode(obj)
  File "/Users/martin/.pyenv/versions/3.10.13/lib/python3.10/json/encoder.py", line 201, in encode
    chunks = list(chunks)
  File "/Users/martin/.pyenv/versions/3.10.13/lib/python3.10/json/encoder.py", line 438, in _iterencode
    o = _default(o)
  File "/Users/martin/.pyenv/versions/3.10.13/lib/python3.10/json/encoder.py", line 179, in default
    raise TypeError(f'Object of type {o.__class__.__name__} '
TypeError: Object of type date is not JSON serializable
```