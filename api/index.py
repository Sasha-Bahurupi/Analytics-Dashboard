import sys
import os

# Add the project root to the python path to ensure the backend module is found
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(project_root, 'backend')

if project_root not in sys.path:
    sys.path.append(project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.main import app
