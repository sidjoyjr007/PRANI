
import logging
import re
import ast
import json
import tempfile
import os
import shutil
import docker
import traceback
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def extract_imports(code: str) -> List[str]:
    """
    Extract top-level imports from Python code to determine dependencies.
    """
    imports = set()
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])
    
    # Filter out standard library modules (approximation)
    # A robust solution would check against a list of stdlib modules for the target python version.
    # For now, we will just list some common 3rd party ones we might expect or let pip handle it (it might fail if stdlib).
    # Better approach: Just try to install everything that is imported? No, that's slow.
    # Alternative: Only install what is explicitly likely to be 3rd party.
    # Let's just return all top-level imports. The caller can decide what to install.
    # Actually, pip install stdlib_module usually fails or does nothing.
    
    # List of common 3rd party libs to explicitly support auto-install
    common_packages = {
        "requests", "numpy", "pandas", "scikit-learn", "matplotlib", "seaborn", 
        "scipy", "bs4", "beautifulsoup4", "openai", "langchain", "pydantic", "fastapi"
    }
    
    # Map import names to package names if different
    package_map = {
        "bs4": "beautifulsoup4",
        "sklearn": "scikit-learn",
        "PIL": "Pillow",
        "cv2": "opencv-python"
    }
    
    final_packages = set()
    for imp in imports:
        # Check package map first
        pkg = package_map.get(imp, imp)
        # If it's a known common package or just pass it through?
        # Let's pass it through. If pip fails, we catch it?
        final_packages.add(pkg)
        
    # Remove stdlib modules to save time (limited list)
    stdlib = {
        "os", "sys", "json", "time", "datetime", "math", "random", "re", 
        "typing", "collections", "itertools", "functools", "logging", "ast", "shutil", "tempfile"
    }
    
    return list(final_packages - stdlib)

def convert_inputs(inputs: Dict[str, Any], input_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convert string inputs to their target types based on tool definition.
    """
    converted = {}
    for field in input_fields:
        name = field.get("name")
        type_str = field.get("type", "str")
        value = inputs.get(name)
        
        # Handle empty/missing values
        # If type is not string, empty string should be treated as missing/default
        if value is None or (isinstance(value, str) and value == "" and type_str != "str"):
            if field.get("default") is not None:
                 converted[name] = field.get("default")
            continue
            
        try:
            if type_str == "int":
                converted[name] = int(value)
            elif type_str == "float":
                converted[name] = float(value)
            elif type_str == "bool":
                if isinstance(value, str):
                    converted[name] = value.lower() in ("true", "1", "yes", "t")
                else:
                    converted[name] = bool(value)
            elif type_str == "list":
                if isinstance(value, str):
                    converted[name] = json.loads(value)
                else:
                    converted[name] = list(value)
            elif type_str == "dict":
                if isinstance(value, str):
                    converted[name] = json.loads(value)
                else:
                    converted[name] = dict(value)
            else: # str
                converted[name] = str(value)
        except Exception as e:
            logger.warning(f"Failed to convert input {name} to {type_str}: {e}")
            # Keep original value if conversion fails (or raise error?)
            converted[name] = value
            
    return converted

def execute_python_tool(code: str, inputs: Dict[str, Any], secrets: Dict[str, str], input_fields: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Execute python tool in a Docker container.
    """
    
    # 1. Type Conversion
    if input_fields:
        try:
            inputs = convert_inputs(inputs, input_fields)
        except Exception as e:
            return {"success": False, "error": f"Input conversion failed: {str(e)}"}
            
    # 2. Dependency Analysis
    dependencies = extract_imports(code)
    
    # 3. Secure Variables Handling
    # Replace {{env.VAR}} mostly for compatibility, but we rely on Env injection.
    processed_code = code
    
    # We iterate through keys to perform replacement
    for key in secrets.keys():
        # 1. Handle Quoted: " {{env.KEY}} " or ' {{env.KEY}} '
        # Users often write: api_key = "{{env.API_KEY}}"
        # If we just replace inner part, we get: api_key = "os.environ.get('API_KEY')" -> String literal!
        # We want: api_key = os.environ.get('API_KEY') -> Function call
        # So we match the quotes and replace the whole thing.
        
        quoted_pattern = f"([\"']){{{{env.{key}}}}}\\1"
        processed_code = re.sub(quoted_pattern, f"os.environ.get('{key}')", processed_code)

        # 2. Handle Unquoted: {{env.KEY}}
        # e.g. api_key = {{env.API_KEY}}
        unquoted_pattern = f"{{{{env.{key}}}}}"
        processed_code = processed_code.replace(unquoted_pattern, f"os.environ.get('{key}')")
    
    # 4. Create Isolation Context
    client = docker.from_env()
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Write user code
        # Ensure 'import os' is present for env var retrieval
        if "import os" not in processed_code:
            final_code = "import os\n" + processed_code
        else:
            final_code = processed_code
            
        user_code_path = os.path.join(temp_dir, "user_tool.py")
        with open(user_code_path, "w") as f:
            f.write(final_code)
            
        # Write inputs.json
        with open(os.path.join(temp_dir, "inputs.json"), "w") as f:
            json.dump(inputs, f)

        # Write runner script
        runner_script = """
import sys
import json
import os
import traceback

# Add current dir to path
sys.path.append(os.getcwd())

try:
    # 1. Parse Inputs (from file)
    with open('inputs.json', 'r') as f:
        inputs = json.load(f)
    
# 2. Import User Module
    import user_tool
    import inspect
    
    # 3. Check Function
    if not hasattr(user_tool, "execute_tool"):
        print(json.dumps({"status": "error", "error": "Function 'execute_tool' not found"}))
        sys.exit(0)
        
    func = user_tool.execute_tool
    
    # 4. Execute
    # Check signature to see how to call it
    sig = inspect.signature(func)
    params = list(sig.parameters.keys())
    
    if len(params) == 0:
        result = func()
    elif len(params) == 1 and params[0] == 'inputs':
        result = func(inputs)
    else:
        # Helper: check for **kwargs
        has_kwargs = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values())
        
        if has_kwargs:
            result = func(**inputs)
        else:
            # Filter inputs to only those accepted by the function
            # This prevents TypeError if UI sends extra fields
            filtered = {k: v for k, v in inputs.items() if k in params}
            result = func(**filtered)
    
    # 5. Output Result
    print(json.dumps({"status": "success", "result": result}))
    
except Exception as e:
    tb = traceback.format_exc()
    print(json.dumps({"status": "error", "error": str(e), "traceback": tb}))
"""
        runner_path = os.path.join(temp_dir, "runner.py")
        with open(runner_path, "w") as f:
            f.write(runner_script)

        # 5. Prepare Container Execution
        # Install deps command
        pip_cmd = ""
        if dependencies:
            deps_str = " ".join(dependencies)
            pip_cmd = f"pip install {deps_str} && "
            
        cmd = f"{pip_cmd}python runner.py"
        
        # Inject secrets as Env Vars
        env_vars = secrets.copy()
        
        # 6. Run Container
        container = client.containers.run(
            "python:3.10-slim",
            command=f"/bin/sh -c \"{cmd}\"",
            volumes={temp_dir: {'bind': '/app', 'mode': 'rw'}},
            working_dir="/app",
            environment=env_vars,
            remove=True,
            stdout=True,
            stderr=True,
            # network_mode="host" # Removed to allow default bridge networking
        )
        
        # 7. Parse Output
        output = container.decode("utf-8")
        
        # The output might contain pip logs and other noise. 
        # We need to find the last JSON line which should be our result.
        lines = output.strip().split("\n")
        json_result = None
        
        for line in reversed(lines):
            try:
                data = json.loads(line)
                if "status" in data:
                    json_result = data
                    break
            except json.JSONDecodeError:
                continue
                
        if not json_result:
             return {
                "success": False,
                "error": "Failed to parse container output",
                "raw_output": output
            }
            
        if json_result["status"] == "error":
            return {
                "success": False,
                "error": json_result.get("error"),
                "traceback": json_result.get("traceback")
            }
            
        return {
            "success": True,
            "result": json_result["result"]
        }

    except docker.errors.ContainerError as e:
        return {"success": False, "error": f"Container Error: {e.stderr.decode('utf-8') if e.stderr else str(e)}"}
    except docker.errors.ImageNotFound:
        return {"success": False, "error": "Docker image 'python:3.10-slim' not found. Please pull it first."}
    except Exception as e:
        return {"success": False, "error": f"Execution Error: {str(e)}"}
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
