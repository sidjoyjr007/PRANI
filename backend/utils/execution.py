
import logging
import re
import ast
import json
import tempfile
import os
import shutil
import docker
import requests
import traceback
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def extract_imports(code: str) -> List[str]:
    """
    Extract all top-level imports from Python code to determine third-party dependencies.
    Built-in stdlib modules are excluded so they are never passed to pip.
    """
    import sys
    # All known stdlib module names
    stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
        "os", "sys", "re", "json", "math", "time", "datetime", "random", "string",
        "hashlib", "hmac", "base64", "uuid", "pathlib", "io", "collections",
        "itertools", "functools", "operator", "copy", "pprint", "types", "typing",
        "abc", "contextlib", "dataclasses", "enum", "weakref", "gc", "inspect",
        "traceback", "logging", "warnings", "unittest", "doctest",
        "smtplib", "imaplib", "poplib", "email", "mailbox", "html", "xml",
        "http", "urllib", "ftplib", "telnetlib", "socket", "ssl", "select",
        "asyncio", "threading", "multiprocessing", "concurrent", "subprocess",
        "csv", "configparser", "pickle", "shelve", "sqlite3", "zipfile",
        "tarfile", "gzip", "bz2", "lzma", "tempfile", "shutil", "glob",
        "fnmatch", "stat", "platform", "struct", "codecs", "textwrap", "unicodedata",
        "argparse", "getopt", "getpass", "signal", "atexit", "sysconfig",
    }

    imports = set()
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                top = alias.name.split(".")[0]
                if top not in stdlib_modules:
                    imports.add(top)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                top = node.module.split(".")[0]
                if top not in stdlib_modules:
                    imports.add(top)

    return list(imports)

def convert_inputs(inputs: Dict[str, Any], input_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convert string inputs to their target types based on tool definition.
    """
    converted = {}
    if not input_fields:
        return inputs
        
    for field in input_fields:
        name = field.get("name")
        type_str = field.get("type", "str")
        value = inputs.get(name)
        
        # Handle empty/missing values
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
            converted[name] = value
            
    return converted

def execute_python_tool(code: str, inputs: Dict[str, Any], secrets: Dict[str, str], input_fields: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Execute python tool in a Docker container.
    """
    
    # 1. Type Conversion
    try:
        inputs = convert_inputs(inputs, input_fields)
    except Exception as e:
        return {"success": False, "error": f"Input conversion failed: {str(e)}"}
            
    # 2. Dependency Analysis
    dependencies = extract_imports(code)
    
    # 3. Secure Variables Handling (Templating)
    processed_code = code
    for key in secrets.keys():
        quoted_pattern = f"([\"']){{{{env.{key}}}}}\\1"
        processed_code = re.sub(quoted_pattern, f"os.environ.get('{key}')", processed_code)
        unquoted_pattern = f"{{{{env.{key}}}}}"
        processed_code = processed_code.replace(unquoted_pattern, f"os.environ.get('{key}')")
    
    # 4. Create Isolation Context
    client = docker.from_env()
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Dedent: remove common leading whitespace that gets saved when
        # code is written inside an indented block in the UI / DB.
        import textwrap
        processed_code = textwrap.dedent(processed_code)
        
        # Write user code
        if "os.environ" in processed_code and "import os" not in processed_code:
            final_code = "import os\n" + processed_code
        else:
            final_code = processed_code
            
        user_code_path = os.path.join(temp_dir, "user_tool.py")
        with open(user_code_path, "w") as f:
            f.write(final_code)
            
        with open(os.path.join(temp_dir, "inputs.json"), "w") as f:
            json.dump(inputs, f)

        # Write runner script
        runner_script = """
import sys
import json
import os
import traceback
import inspect

sys.path.append(os.getcwd())

try:
    with open('inputs.json', 'r') as f:
        inputs = json.load(f)
    
    import user_tool
    if not hasattr(user_tool, "execute_tool"):
        print(json.dumps({"status": "error", "error": "Function 'execute_tool' not found"}))
        sys.exit(0)
        
    func = user_tool.execute_tool
    sig = inspect.signature(func)
    params = list(sig.parameters.keys())
    
    if len(params) == 0:
        result = func()
    elif len(params) == 1 and params[0] == 'inputs':
        result = func(inputs)
    else:
        has_kwargs = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values())
        if has_kwargs:
            result = func(**inputs)
        else:
            # Build kwargs: value from inputs if present, else None for required params,
            # else skip (let the default apply) for optional params.
            _EMPTY = inspect.Parameter.empty
            kwargs = {}
            for pname, param in sig.parameters.items():
                if pname in inputs:
                    kwargs[pname] = inputs[pname]
                elif param.default is _EMPTY:
                    kwargs[pname] = None  # required but not supplied → pass None
                # else optional with default → don't pass, use its own default
            result = func(**kwargs)
    
    print(json.dumps({"status": "success", "result": result}))
    
except Exception as e:
    tb = traceback.format_exc()
    print(json.dumps({"status": "error", "error": str(e), "traceback": tb}))
"""
        runner_path = os.path.join(temp_dir, "runner.py")
        with open(runner_path, "w") as f:
            f.write(runner_script)

        # 5. Prepare Container Execution
        pip_cmd = ""
        if dependencies:
            logger.debug(f"execute_python_tool: installing dependencies: {dependencies}")
            deps_str = " ".join(dependencies)
            # Use -q for quiet but catch errors
            pip_cmd = f"pip install -q {deps_str} && "
            
        cmd = f"{pip_cmd}python runner.py"
        
        # 6. Run Container with Timeout
        logger.debug("execute_python_tool: starting docker run")
        # Initialize client with a 10s daemon connection timeout
        client = docker.from_env(timeout=10)
        
        # Start container detached so we can wait with a timeout
        container = client.containers.run(
            "python:3.11-slim",
            command=f"/bin/sh -c \"{cmd}\"",
            volumes={temp_dir: {'bind': '/app', 'mode': 'rw'}},
            working_dir="/app",
            environment=secrets,
            detach=True,
            stdout=True,
            stderr=True,
        )
        
        try:
            logger.debug("execute_python_tool: waiting for container (60s limit)")
            # Wait for container to exit with timeout
            # wait() returns a dict with 'StatusCode'
            exit_info = container.wait(timeout=60)
            exit_code = exit_info.get("StatusCode", 0)
            
            # Fetch logs
            container_output = container.logs()
            logger.debug(f"execute_python_tool: run complete, exit_code={exit_code}")
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            # If wait() times out, kill and remove the container
            logger.warning("execute_python_tool: container timed out, killing...")
            try:
                container.kill()
            except:
                pass
            return {"success": False, "error": "Execution Timeout: The tool execution exceeded the 60-second limit and was terminated."}
        finally:
            # Always clean up
            try:
                container.remove(force=True)
            except:
                pass
        
        # 7. Parse Output
        output = container_output.decode("utf-8")
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
             return {"success": False, "error": "Failed to parse container output", "raw_output": output}
            
        if json_result["status"] == "error":
            return {"success": False, "error": json_result.get("error"), "traceback": json_result.get("traceback")}
            
        return {"success": True, "result": json_result["result"]}

    except docker.errors.ContainerError as e:
        # ContainerError may expose output via .stderr or .output depending on SDK version
        raw = getattr(e, "stderr", None) or getattr(e, "output", None) or b""
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8", errors="replace")
        return {"success": False, "error": f"Container error: {raw or str(e)}"}
    except docker.errors.ImageNotFound:
        return {"success": False, "error": "Docker image 'python:3.11-slim' not found. Please pull it first."}
    except requests.exceptions.ReadTimeout:
        return {"success": False, "error": "Execution Timeout: The tool execution exceeded the 60-second limit and was terminated."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Docker Connection Error: Could not communicate with the Docker daemon."}
    except Exception as e:
        return {"success": False, "error": f"Execution Error: {str(e)}"}
    finally:
        if 'temp_dir' in locals():
            shutil.rmtree(temp_dir, ignore_errors=True)
