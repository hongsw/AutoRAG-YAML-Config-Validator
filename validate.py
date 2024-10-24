import json
import yaml
from jsonschema import validate, ValidationError
from jsonschema.exceptions import best_match

def load_yaml(file_path):
    try:
        with open(file_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as error:
        print(f"Error loading YAML file {file_path}: {str(error)}")
        return None

def load_json_schema(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except Exception as error:
        print(f"Error loading JSON schema {file_path}: {str(error)}")
        return None

def validate_config(config, schema):
    try:
        validate(instance=config, schema=schema)
        print('Configuration is valid!')
        return True
    except ValidationError as error:
        print('Validation errors:')
        print(f"Path: {' -> '.join(str(path) for path in error.absolute_path)}")
        print(f"Message: {error.message}")
        
        if error.context:
            print("Additional errors:")
            for err in error.context:
                print(f"  - {err.message}")
        
        print("\nProblematic config part:")
        current_obj = config
        for path in error.absolute_path:
            current_obj = current_obj[path]
        print(json.dumps(current_obj, indent=2))
        
        return False

# Main execution
schema = load_json_schema('config_schema.json')
config = load_yaml('config/config.yaml')

if schema and config:
    print('Validating configuration...')
    is_valid = validate_config(config, schema)
    
    if is_valid:
        print('Config is valid. Proceeding with further processing...')
        # Here you can add any additional processing of the valid config
    else:
        print('Config is invalid. Please correct the errors and try again.')
else:
    print('Failed to load schema or config. Please check the files and try again.')
